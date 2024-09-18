const Note = require('../models/noteModel');

exports.createNote = async (req, res) => {
    const { title, content } = req.body;

    const note = new Note({
        title,
        content,
        user: req.user._id,
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
};

exports.getNotes = async (req, res) => {
    console.log('Fetching notes for user:', req.user._id); // Debugging log
    const notes = await Note.find({ user: req.user._id });
    console.log('Notes fetched:', notes); // Debugging log
    res.json(notes);
};



exports.updateNote = async (req, res) => {
    const { title, content } = req.body;

    const note = await Note.findById(req.params.id);

    if (note.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
    }

    if (note) {
        note.title = title || note.title;
        note.content = content || note.content;
        const updatedNote = await note.save();
        res.json(updatedNote);
    } else {
        res.status(404).json({ message: 'Note not found' });
    }
};


exports.deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await Note.deleteOne({ _id: req.params.id }); // Updated line
        res.json({ message: 'Note removed' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
