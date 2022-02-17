import { useDocument } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, query, where, getDoc, writeBatch, deleteField, arrayRemove, arrayUnion } from "firebase/firestore";
import { auth, storage } from "./firebase";
import { useEffect, useState } from "react";
import { Container, Typography, Button, Table, TableBody, TableHead, TableRow, TableCell } from "@mui/material";
import BotCard from './BotCard';

const MyTeamPlayers = ({self, owner, players, buttonText, buttonAction, buttonShow, capacity}) => {
    const is_leader = self.uid === owner.uid;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align="right">Action</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {players.map((player)=>
                    <TableRow key={player.uid}>
                        <TableCell>{player.name}</TableCell>
                        {buttonShow(is_leader, players.length, capacity) && <TableCell align="right"><Button onClick={()=>{buttonAction(player);}}>{buttonText}</Button></TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

const showMemberActionButton = (is_leader, teamSize, capacity) => {
    return (is_leader && teamSize > 0);
}

const showPendingJoinButton = (is_leader, teamSize, capacity) => {
    return (is_leader && capacity > teamSize);
}

const removeUserFromTeam = async (userToRemove, team) => {
    const batch = writeBatch(storage);
    const userRef = doc(storage, "/users", userToRemove.uid);
    batch.update(userRef, {
        team: deleteField()
    });
    const teamRef = team.doc;
    if (team.data.members.length == 1) {
        batch.delete(teamRef);
    } else {
        batch.update(teamRef, {
            members: arrayRemove(userToRemove)
        });
    }
    try {
        await batch.commit();
        window.location.reload(false);
    } catch(e) {
        console.log(e);
    }
}

const addUserToTeam = async (userToAdd, team) => {
    const batch = writeBatch(storage);
    const teamRef = team.doc;

    batch.update(teamRef, {
        members: arrayUnion(userToAdd),
        pendingJoins: arrayRemove(userToAdd)
    })

    const userRef = doc(storage, "/users", userToAdd.uid);
    batch.update(userRef, {
        pendingJoin: deleteField(),
        team: teamRef
    });

    try {
        await batch.commit();
        window.location.reload(false);
    } catch(e) {
        console.log(e);
    }
}

const MyTeam = ({user}) => {
    
    const [team, setTeam] = useState(null);

    useEffect(async ()=>{
        if (!!user) {
            const userRef = doc(storage, "/users", user.uid);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists() && userDoc.data().team) {
                console.log(userDoc.data().team)
                // const teamRef = doc(storage, userDoc.data().team);
                const teamDoc = await getDoc(userDoc.data().team);
                if (teamDoc.exists()) {
                    const asyncHiderBots = [];
                    const asyncSeekerBots = [];
                    for (let i = 0; i < teamDoc.data().hider_bots.length; i++)
                        asyncHiderBots.push(getDoc(teamDoc.data().hider_bots[i]));
                    
                    for (let i = 0; i < teamDoc.data().seeker_bots.length; i++)
                        asyncSeekerBots.push(getDoc(teamDoc.data().seeker_bots[i]));

                    const hiderBots = Array(2).fill(null);;
                    for (let i = 0; i < asyncHiderBots.length; i++) {
                        const res = await asyncHiderBots[i];
                        hiderBots[i] = res.data();
                    }
                    const seekerBots = Array(2).fill(null);
                    for (let i = 0; i < asyncSeekerBots.length; i++) {
                        const res = await asyncSeekerBots[i];
                        seekerBots[i] = res.data();
                    }

                    setTeam({
                        doc: userDoc.data().team,
                        data: teamDoc.data(),
                        seekerBots,
                        hiderBots
                    });
                }
            }
        }
    }, [user]);

    console.log(user, team);

    return (
        <div>
            {team ? 
                <Container maxWidth="md">
                    <Typography variant="h4">Team name: {team.data.name}</Typography>
                    <Typography variant="h5">Team size: {team.data.members.length} / {team.data.maxCapacity}</Typography>
                    <Typography variant="h5">Team members:</Typography>
                    <MyTeamPlayers 
                        players={team.data.members} 
                        owner={team.data.members[0]}
                        buttonText={"Remove"}
                        buttonShow={showMemberActionButton}
                        buttonAction={(userToRemove)=>{removeUserFromTeam(userToRemove, team)}}
                        self={user}
                        capacity={team.maxCapacity}/>
                    <Typography variant="h5">Pending joins:</Typography>
                    <MyTeamPlayers 
                        players={team.data.pendingJoins} 
                        owner={team.data.members[0]}
                        buttonText="Add"
                        buttonShow={showPendingJoinButton}
                        buttonAction={(userToAdd)=>{addUserToTeam(userToAdd, team)}} 
                        self={user}
                        capacity={team.data.maxCapacity}/>
                    <Typography variant="h5">Seeker Bots:</Typography>
                    {team.seekerBots.map((seekerBot, index)=> 
                        <BotCard key={"seeker_slot"+index} bot={seekerBot} botType={"seeker"} teamRef={team.doc}/>
                    )}
                    <Typography variant="h5">Hider Bots:</Typography>
                    {team.hiderBots.map((hiderBot,index)=>
                        <BotCard key={"hider_slot"+index} bot={hiderBot} botType={"hider"} teamRef={team.doc}/>
                    )}
                    
                </Container>
                :
                <Container maxWidth="md" height="100%">
                    <center>
                        <Typography variant="h5">
                            You are not part of a team yet! 
                        </Typography>
                        <Typography variant="h6">
                            Go create or join one on the Teams page
                        </Typography>
                    </center>
                </Container>
            }
            
        </div>
    )
}

export default MyTeam;