import { Dialog, 
    DialogActions, 
    DialogContent, 
    DialogContentText, 
    DialogTitle,
    Button,
    TextField, 
    Typography} from "@mui/material";
import { collection, writeBatch, doc } from "firebase/firestore";
import { useState } from "react";
import { storage } from "./firebase";


const CreateTeamDialog = ({open, setOpen, allTeams, user}) => {
    const [teamName, setTeamName] = useState("");

    const handleClose = () => {setOpen(false)};
    const handleSubmit = async () => {
        if (teamName === "") {
            alert("Must enter a team name");
            return;
        }
        if (allTeams.includes(teamName)) {
            alert("Team name already taken");
            return;
        }

        const batch = writeBatch(storage);
        const newTeamRef = doc(collection(storage, "/teams"));
        batch.set(newTeamRef, {
            name: teamName,
            members: [{
                name: user.displayName,
                uid: user.uid,
            }],
            pendingJoins: [],
            maxCapacity: 4,
            hider_bots: [],
            seeker_bots: []
        });
        const selfRef = doc(storage, "/users", user.uid);
        batch.update(selfRef, {
            team: newTeamRef
        });
        try {
            await batch.commit();
            setOpen(false);
        } catch (e) {
            console.log(e);
        }
    };
    

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Create a new team</DialogTitle>
            <DialogContent>
                <DialogContent style={{flexDirection: "down"}}>
                    <Typography>Team Name:</Typography>
                    <TextField variant="filled" onChange={(e)=>{setTeamName(e.target.value)}}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button disabled={!teamName} onClick={handleSubmit}>Submit</Button>
                </DialogActions>
            </DialogContent>
        </Dialog>
    )
}

export default CreateTeamDialog;