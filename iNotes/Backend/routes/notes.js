
const express = require('express')
const router = express.Router()

const { body, validationResult } = require('express-validator');

const fetchuser = require('../middleware/fetchuser')
const Notes = require('../models/Notes')

// ROUTE 1 : This is to show all notes of a user -> GET : /api/notes/fetchallnotes

router.get('/fetchallnotes', fetchuser, async (req, resp) => {

    try {

        const notes = await Notes.find({ user: req.user.id })
        resp.json(notes)

    } catch (error) {
        // console.error(error.message);
        resp.status(500).send("Some error occured in internal server...")
    }

})





// ROUTE 2 : Add a new note using user -> POST : /api/notes/addnotes

router.post('/addnotes', fetchuser, [

    // Validation for title and password
    body('title', 'Title must be of length 5').isLength({ min: 5 }),
    body('description', 'Description must be of length 8').isLength({ min: 8 }),

], async (req, resp) => {

    try {
        const { title, description, tag } = req.body;


        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return resp.status(400).json({ errors: errors.array() });
        }

        const note = new Notes({
            title, description, tag, user: req.user.id
        })


        // Saving the notes in the db
        const savedNotes = await note.save()
        resp.json(savedNotes)

    } catch (error) {
        // console.log(error.message)
        resp.status(409).send("Same description already present... Try something different to distinguish...")

    }


})






// ROUTE 3 : Update existing notes of a user -> PUT : /api/notes/updatenotes/:id

router.put('/updatenotes/:id', fetchuser, async (req, resp) => {

    try {

        const { title, description, tag } = req.body
        // Create a new note object
        const newNote = {}
        if(title) newNote.title = title
        if(description) newNote.description = description
        if(tag) newNote.tag = tag

        // Find the note to be updated and update it
        let note = await Notes.findById(req.params.id)


        // If note is there update it
        if(!note) return resp.status(404).send("Not found...")

        // If the user is authorised go ahead else throw error message
        if(note.user.toString() !== req.user.id) {
            return resp.status(401).send("Access denied... Unauthorised access !!!")
        }
        

        // Note change will replicate from here
        note = await Notes.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})

       resp.json({note})


    } catch (error) {
        // console.error(error.message);
        resp.status(500).send("Some error occured in internal server...")
    }

})









// ROUTE 3 : Delete existing notes of a user -> DELETE : /api/notes/deletenotes/:id

router.delete('/deletenotes/:id', fetchuser, async (req, resp) => {

    try {


        // Find the note to be delete and delete it
        let note = await Notes.findById(req.params.id)

        // If note is there delete it
        if(!note) return resp.status(404).send("Not found...")

        // If the user is authorised go ahead else throw error message
        if(note.user.toString() != req.user.id) {
            return resp.status(401).send("Access denied... Unauthorised access !!!")
        }


        // Note change will replicate from here
        note = await Notes.findByIdAndDelete(req.params.id)

       resp.json({ "Message":"Success... Your note has been deleted", note:note })


    } catch (error) {
        // console.error(error.message);
        resp.status(500).send("Some error occured in internal server...")
    }

})



module.exports = router
