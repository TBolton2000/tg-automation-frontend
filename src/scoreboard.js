import { useState, useEffect } from "react";
import { Container, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import {doc, getDoc} from "firebase/firestore";
import { useDocumentData } from "react-firebase-hooks/firestore";
import {storage} from "./firebase";


const Scoreboard = () => {
    const scoreboardIndexDoc = doc(storage, "/scoreboard/nextScoreboardId");
    const [scoreboardIndex, docLoading, docError] = useDocumentData(scoreboardIndexDoc);

    const [scoreboardData, setScoreboardData] = useState(undefined);

    useEffect(async ()=> {
        if (scoreboardIndex && scoreboardIndex.value)
            setScoreboardData((await getDoc(doc(storage, `/scoreboard/${scoreboardIndex.value-1}`))).data());
    }, [scoreboardIndex]);

    return (
        <Container>
            <Grid container>
                <Grid item md={6} xs={12} padding="10px">
                    <Typography variant="h6">Seeker Leaderboard</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell>Bot Name</TableCell>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                    {!docLoading && !docError && !!scoreboardData &&
                        scoreboardData.seekers.sort((first, second)=>
                        {return first.average_points > second.average_points ? -1 : 1;})
                        .map((seeker)=>
                            <TableRow key={seeker.id}>
                                <TableCell>{seeker.name}</TableCell>
                                <TableCell>{seeker.team}</TableCell>
                                <TableCell>{seeker.average_points.toFixed(3)}</TableCell>
                            </TableRow>
                        )
                    }
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item md={6} xs={12} padding="10px">
                    <Typography variant="h6">Hider Leaderboard</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                            <TableCell>Bot Name</TableCell>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                    {!docLoading && !docError && !!scoreboardData &&
                        scoreboardData.hiders.sort((first, second)=>
                        {return first.average_points > second.average_points ? -1 : 1})
                        .map((hider)=>
                            <TableRow key={hider.id}>
                                <TableCell>{hider.name}</TableCell>
                                <TableCell>{hider.team}</TableCell>
                                <TableCell>{hider.average_points.toFixed(3)}</TableCell>
                            </TableRow>
                        )
                    }
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
        </Container>
    );
}

export default Scoreboard;