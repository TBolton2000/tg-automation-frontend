import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { collection, doc, query, where, writeBatch, arrayUnion, arrayRemove } from "firebase/firestore";
import { storage, auth } from "./firebase";
import { Button, Table, TableBody, TableHead, TableRow, TableCell, Container, Typography } from "@mui/material";
import TeamRow from "./TeamRow";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";


const Teams = ({user}) => {

    const teamsRef = collection(storage, "/teams");
    const teamsQuery = query(teamsRef);
    const [teamsSnapshot, teamsLoading, teamsError] = useCollection(teamsQuery);

    console.log(user.uid);
    const userRef = doc(storage, "/users", user.uid);
    const userQuery = query(userRef);
    const [userData, userLoading, userError] = useDocumentData(userQuery);

    const joinPendingForTeam = async (teamRef) => {
        const batch = writeBatch(storage);
        const selfRef = doc(storage, "/users", user.uid);
        batch.update(selfRef, {
            pendingJoin: teamRef
        });
        batch.update(teamRef, {
            pendingJoins: arrayUnion({
                name: userData.name, 
                uid: user.uid
            })
        });
        try {
            await batch.commit();
        } catch(e) {
            console.log(e);
        }
    };

    const unJoinPendingForTeam = async (teamRef) => {
        const batch = writeBatch(storage);
        const selfRef = doc(storage, "/users", user.uid);
        batch.update(selfRef, {
            pendingJoin: undefined
        });
        batch.update(teamRef, {
            pendingJoins: arrayRemove({
                name: userData.name, 
                uid: user.uid
            })
        });
        try {
            await batch.commit();
        } catch(e) {
            console.log(e);
        }
    };
    
    console.log(user);

    return (
        <Container fixed>
            {user === null || teamsLoading || userLoading ? <p>loading...</p> : <p>loaded</p>}
            {userError && <Typography>User Error Occurred: {userError.message}</Typography>}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Team Name</TableCell>
                        <TableCell>Team Member 1</TableCell>
                        <TableCell>Team Member 2</TableCell>
                        <TableCell>Team Member 3</TableCell>
                        <TableCell>Team Member 4</TableCell>
                        <TableCell>Capacity</TableCell>
                        <TableCell>Join?</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {!teamsLoading && !teamsError && !userLoading && !userError &&
                        teamsSnapshot.docs.map(
                            (doc)=><TeamRow 
                                    key={doc.id} 
                                    name={doc.data().name}
                                    members={doc.data().members}
                                    maxCapacity={doc.data().maxCapacity}
                                    onJoin={joinPendingForTeam}
                                    onUnjoin={unJoinPendingForTeam}
                                    teamId={doc.id}
                                    usersPendingJoinTeamRef={userData.pendingJoin}
                                    usersTeamRef={userData.team}/>)
                    }
                </TableBody>
            </Table>
        </Container>
    )
}

export default Teams;