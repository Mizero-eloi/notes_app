// backend/routes/noteRoutes.js
const express = require('express');
const router = express.Router();
const { Note } = require('../models');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');

// GET /notes - Fetch all notes
router.get('/', async (req, res) => {
  try {
    const notes = await Note.findAll();
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
});

// POST /notes - Create a new note
router.post('/', [
  // Validation middleware
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('uuid').notEmpty().withMessage('UUID is required')
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check for duplicate UUIDs to handle offline sync
    const existingNote = await Note.findOne({
      where: { uuid: req.body.uuid }
    });

    if (existingNote) {
      // Update existing note
      await existingNote.update({
        title: req.body.title,
        content: req.body.content,
        synced: true,
        updatedAt: new Date()
      });
      
      // Emit Socket.IO event
      const io = req.app.get('io');
      io.emit('note:synced', existingNote);
      
      return res.status(200).json(existingNote);
    }
    
    // Create new note
    const newNote = await Note.create({
      title: req.body.title,
      content: req.body.content,
      uuid: req.body.uuid,
      synced: true,
      createdAt: req.body.createdAt || new Date(),
      updatedAt: req.body.updatedAt || new Date()
    });
    
    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('note:created', newNote);
    
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
});

// POST /notes/batch - Accept batch notes (from offline queue)
router.post('/batch', async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!Array.isArray(notes) || notes.length === 0) {
      return res.status(400).json({ message: 'Invalid batch format or empty batch' });
    }

    const results = [];
    const io = req.app.get('io');

    // Process each note in the batch
    for (const note of notes) {
      // Look for existing note with the same UUID
      const existingNote = await Note.findOne({
        where: { uuid: note.uuid }
      });

      if (existingNote) {
        // Update if existing note is older
        const existingDate = new Date(existingNote.updatedAt);
        const incomingDate = new Date(note.updatedAt);
        
        if (incomingDate > existingDate) {
          await existingNote.update({
            title: note.title,
            content: note.content,
            synced: true,
            updatedAt: note.updatedAt
          });
          
          io.emit('note:synced', existingNote);
          results.push({ uuid: note.uuid, status: 'updated' });
        } else {
          results.push({ uuid: note.uuid, status: 'skipped' });
        }
      } else {
        // Create new note
        const newNote = await Note.create({
          title: note.title,
          content: note.content,
          uuid: note.uuid,
          synced: true,
          createdAt: note.createdAt || new Date(),
          updatedAt: note.updatedAt || new Date()
        });
        
        io.emit('note:created', newNote);
        results.push({ uuid: note.uuid, status: 'created' });
      }
    }

    res.status(200).json({ results });
  } catch (error) {
    console.error('Error processing batch:', error);
    res.status(500).json({ message: 'Failed to process batch', error: error.message });
  }
});

// Additional routes can be added as needed
// GET /notes/:id - Get a specific note
// PUT /notes/:id - Update a note
// DELETE /notes/:id - Delete a note

module.exports = router;