// backend/models/note.js
module.exports = (sequelize, DataTypes) => {
    const Note = sequelize.define('Note', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      synced: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
    
    return Note;
  };