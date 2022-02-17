import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import {auth, signInWithGoogle, logOut} from "./firebase";
import {ReactComponent as LogoIcon} from "./logo.svg";
import {AppBar, Button, Toolbar, Typography, Box, SvgIcon, IconButton, Link} from "@mui/material"



const NavBar = () => {
    const [user, loading, error] = useAuthState(auth);
    return (
        // <Box sx={{ flexGrow: 1 }}>
        <AppBar position="sticky">
            <Toolbar>
                {/* <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="Logo"
                sx={{ mr: 2 }}>  */}
                    {/* <SvgIcon edge="start" fontSize="large" sx={{ mr: 2 }} viewBox="0 0 2732.000000 2048.000000" component={LogoIcon}></SvgIcon>                 */}
                    <Typography variant="h6" component="div">Turing Games</Typography>
                    <Link style={{padding: "10px", textDecoration: "none"}} color="inherit" href="/">Leaderboard</Link>
                    <Link style={{padding: "10px", textDecoration: "none"}} color="inherit" href="/teams">Teams</Link>
                    <Link style={{padding: "10px", textDecoration: "none"}} color="inherit" href="/myteam" sx={{ flexGrow: 1 }}>My Team</Link>
                { !user || loading ?
                <Button color="inherit" onClick={signInWithGoogle}>Log In with Google</Button>
                :
                <div>
                    <Typography variant="">{user.displayName}</Typography>
                    <Button color="inherit" onClick={()=>{logOut()}}>Log Out</Button>
                </div>
                }
            </Toolbar>
        </AppBar>
        // </Box>
    );
}

export default NavBar;