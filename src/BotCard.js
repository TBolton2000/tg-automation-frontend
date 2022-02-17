import "./BotCard.css";

import SubmitBotDialog from './SubmitBotDialog';
import { Button, Container, Card, Typography } from "@mui/material";

import { useState } from 'react';


const BotCard = ({botType, bot, teamRef}) => {
    const [openDialog, setOpenDialog] = useState(false);
    // let dateFromTimestamp;
    // if (bot !== null) {
    //     dateFromTimestamp = new Date(bot.timestamp);
    // } else {
    //     dateFromTimestamp = new Date();
    // }
    // const [hours, minutes, seconds] = [dateFromTimestamp.getHours(), dateFromTimestamp.getMinutes(), dateFromTimestamp.getSeconds()]

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
                    <Typography variant="h5" style={{display:"inline", marginRight: "auto"}}>{bot !== null ? bot.name : "No Bot Submitted"}</Typography>
                    {bot !== null && 
                        <Typography style={{paddingLeft: "10px"}} variant="p">Submitted at {getTimeFromFirebase(bot.timestamp)}</Typography>
                    }
                    <Button style={{float: "right"}} onClick={()=>{setOpenDialog(true)}}>{bot !== null ? "Replace this bot" : "Submit new bot"}</Button>
                <SubmitBotDialog open={openDialog} setOpen={setOpenDialog} botType={botType} bot={bot} teamRef={teamRef}></SubmitBotDialog>
            </Card>
        </Container>
    )
}

export default BotCard;