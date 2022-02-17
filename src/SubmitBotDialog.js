import { Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Button,
    TextField, 
    Typography} from "@mui/material";
import { useEffect, useState } from "react";
import { storage, fileStorage, ref, uploadBytesResumable, getDownloadURL } from "./firebase";
import { doc, Timestamp, writeBatch, arrayRemove, arrayUnion } from "firebase/firestore";

const SubmitBotDialog = ({open, setOpen, botType, bot, teamRef}) => {
    const handleClose = () => { setOpen(false) }
    const handleSubmit = () => {
        // Do some error checking
        // Only allow py files and limit size of file
        // Preprocessing on filename
        if (botName == '') {
            window.alert("Bot name must not be empty");
            return;
        }
        if (file == null) {
            window.alert("Please select a file");
            return;
        }
        if (file.size > Math.pow(2,20)) {
            window.alert("File is too larger, max size = 1MB");
            return;
        }
        if (file.name.indexOf(' ') >= 0) {
            window.alert("File name cannot contain spaces");
            return;
        }


        const timestamp = new Date().valueOf();
        const newBotRef = ref(fileStorage, `/${botType}_bots/${file.name}--${timestamp}`);
        const localUploadTask = uploadBytesResumable(newBotRef, file);

        localUploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
            case 'paused':
                console.log('Upload is paused');
                break;
            case 'running':
                console.log('Upload is running');
                break;
            }
        }, 
        (error) => {
            console.log("Firebase Storage Error: ",error);
        }, 
        () => {
            getDownloadURL(localUploadTask.snapshot.ref).then(async (downloadURL) => {
                const batch = writeBatch(storage);

                console.log("Team Ref:", teamRef);
                if (bot != null) {
                    const oldBotRef = doc(storage, `/${botType}_bots`, `${bot.name}--${bot.timestamp.toMillis()}`);
                    batch.update(oldBotRef, {
                        team: teamRef,
                        replaced: true
                    });
                    const arrayRemoveObj = {};
                    arrayRemoveObj[`${botType}_bots`] = arrayRemove(oldBotRef);
                    batch.update(teamRef, arrayRemoveObj);
                }
                const newBotRef = doc(storage, `/${botType}_bots`, `${botName}--${timestamp}`);
                batch.set(newBotRef, {
                    name: botName,
                    timestamp: Timestamp.fromMillis(timestamp),
                    downloadURL: downloadURL,
                    team: teamRef,
                    replaced: false
                });
                const arrayUnionObj = {};
                arrayUnionObj[`${botType}_bots`] = arrayUnion(newBotRef);
                batch.update(teamRef, arrayUnionObj);
                try {
                    await batch.commit();
                    window.location.reload(false);
                } catch(e) {
                    console.log(e);
                }
            });
        }
        );
    }

    const [botName, setBotName] = useState('');
    const [file, setFile] = useState(null);

    const [submitButtonEnabled, setSubmitButtonEnabled] = useState(false);

    useEffect(
        () => {
            setSubmitButtonEnabled(botName !== '' && file !== null);
        },
    [botName, file]);

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>
                { bot != null ? 
                    `Replace ${bot.name}?` :
                    `Submit a new ${botType} bot`
                }
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please choose a new {botType} bot to submit:
                </DialogContentText>
            </DialogContent>
            <DialogContent style={{flexDirection: "down"}}>
                <Typography>Bot Name:</Typography>
                <TextField variant="filled" onChange={(e)=>{setBotName(e.target.value)}}/>
            </DialogContent>
            <DialogContent style={{flexDirection: "down"}}>
                <Button variant="contained" component="label">
                    Select File
                    <input type="file" hidden onChange={(e)=>{setFile(e.target.files[0])}}/>
                </Button>
                {file !== null &&
                    <Typography>
                        Selected file: {file.name}
                    </Typography>
                }
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button disabled={!submitButtonEnabled} onClick={handleSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    );
}


export default SubmitBotDialog;