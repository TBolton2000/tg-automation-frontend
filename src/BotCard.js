import "./BotCard.css";

import SubmitBotDialog from './SubmitBotDialog';
import { Button, Container, Card, Typography, Table, TableContainer, TableHead, Paper, TableCell, TableBody, TableRow, IconButton, Collapse } from "@mui/material";
// import { KeyboardArrowDownIcon, KeyboardArrowUpIcon } from "@mui/icons-material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import React, { useState } from 'react';
import { Box } from "@mui/system";

const MatchHistoryRow = ({opponentName, opponentErrors, points, games}) => {
  const [open, setOpen] = useState(false)

  return (
      <React.Fragment>
      <TableRow>
          <TableCell>
              <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setOpen(!open)}
              >
                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
              </IconButton>
          </TableCell>
          <TableCell>{opponentName}</TableCell>
          <TableCell align="right">{points}</TableCell>
          {!!games && <TableCell align="right">{games.length - opponentErrors}</TableCell>}
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open}>
            <Box sx={{margin: 1}}>
              <Typography variant="h6" gutterBottom component="div">
                Games:
              </Typography>
              {Array.isArray(games) ?
              <Table size="small" aria-label="games">
                <TableHead>
                  <TableRow>
                    <TableCell>Game</TableCell>
                    <TableCell>Seed</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {!!games && Array.isArray(games) && games.map((gameString, index) => {
                    const [gameNum, seedNum, ...rest] = gameString.split(", ");
                    const message = rest.join(", ");
                    return (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {parseInt(gameNum.split(" ")[1]) + 1}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {seedNum.split(" ")[1]}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {message}
                      </TableCell>
                    </TableRow>)
                  })}
                </TableBody>
              </Table>
              :
              <Typography>Error in match: {games}</Typography>
              }
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      </React.Fragment>
  )
}

const BotCard = ({botType, bot, teamRef}) => {
  const [openDialog, setOpenDialog] = useState(false);

  const getTimeFromFirebase = (fbTimestamp) => {
    let date = fbTimestamp.toDate();
    let hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    let min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    let sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    return hour + ":" + min + ":" + sec;
  }

  return (
    <Container fixed className="botCardContainer">
      <Card className="botCardCard">
        <Container className="botCardHeader">
        <Typography variant="h5" style={{display:"inline", marginRight: "auto"}}>{bot !== null ? bot.name : "No Bot Submitted"}</Typography>
        {bot !== null && 
            <Typography style={{paddingLeft: "10px"}} variant="p">Submitted at {getTimeFromFirebase(bot.timestamp)}</Typography>
        }
        {/* <Button style={{float: "right"}} onClick={()=>{setOpenDialog(true)}}>{bot !== null ? "Replace this bot" : "Submit new bot"}</Button>
        <SubmitBotDialog open={openDialog} setOpen={setOpenDialog} botType={botType} bot={bot} teamRef={teamRef}></SubmitBotDialog> */}
        </Container>
        {bot !== null &&
        <Container>
          <Typography>Match History:</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Opponent Bot</TableCell>
                  <TableCell align="right">Points Earned</TableCell>
                  <TableCell align="right">Games Completed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {Object.keys(bot.matches).map((key)=>{
                    const opponentName = key.split("--164")[0];
                    const points = bot.matches[key][`${botType}_points`];
                    const games = bot.matches[key][`${botType}_info`];
                    console.log("Games:",games);
                    const opponentErrors = bot.matches[key][`${botType === "seeker" ? "hider":"seeker"}_errors`];
                    return <MatchHistoryRow key={key} opponentName={opponentName} opponentErrors={opponentErrors} points={points} games={games}/>
                  }
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
        }
      </Card>
    </Container>
  )
}

export default BotCard;