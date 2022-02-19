import { Button, TableRow, TableCell } from "@mui/material";
import { doc } from "firebase/firestore";
import { storage } from "./firebase";

const TeamRow = ({name, members, maxCapacity, onJoin, onUnjoin, teamId, usersPendingJoinTeamRef, usersTeamRef}) => {
    const teamRef = doc(storage, "/teams", teamId);

    return (
        <TableRow>
            <TableCell>{name}</TableCell>
            <TableCell>{members.length > 0 ? members[0].name : ""}</TableCell>
            <TableCell>{members.length > 1 ? members[1].name : ""}</TableCell>
            <TableCell>{members.length > 2 ? members[2].name : ""}</TableCell>
            <TableCell>{members.length > 3 ? members[3].name : ""}</TableCell>
            <TableCell>{members.length} / {maxCapacity}</TableCell>
            { 
            <TableCell>
                { (usersPendingJoinTeamRef === undefined || usersPendingJoinTeamRef.path === teamRef.path) 
                    && usersTeamRef === undefined && (!!usersPendingJoinTeamRef && usersPendingJoinTeamRef.path === teamRef.path ?
                    <Button onClick={()=>onUnjoin(teamRef)}>Undo</Button>
                    :
                    <Button onClick={()=>onJoin(teamRef)}>Join</Button>)
                }
            </TableCell>
            }
        </TableRow>
    )
}

export default TeamRow;