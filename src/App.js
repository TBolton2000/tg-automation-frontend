import logo from './logo.svg';
import './App.css';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import {storage, auth, signInWithGoogle} from "./firebase";


import {useState} from "react";
import {BrowserRouter as Router, Route, Routes, Navigate} from "react-router-dom";
import {FirebaseAuth} from "react-firebaseui";
import {useAuthState} from "react-firebase-hooks/auth";
import NavBar from './NavBar';
import Teams from './Teams';
import MyTeam from './MyTeam';
import Scoreboard from './scoreboard';

const App = () => {
  
  const [user, loading, error] = useAuthState(auth);

  return (
    <div className="App"> 
      <header className="App-header">
        { !loading && !error &&
        <Router>
        <NavBar user={user}/>
        <Routes>
          <Route path="/">
            <Route index element={<Scoreboard />} />
          </Route>
          {!!user &&
          [<Route key="myteam" path="/myteam" element={<MyTeam user={user}/>} />,
          <Route key="teams" path="/teams" element={<Teams user={user}/>} />]
          }
          {/* <Route key="myteam" path="/myteam" element={<MyTeam user={user}/>} />
          <Route key="teams" path="/teams" element={<Teams user={user}/>} /> */}
        </Routes>
        </Router>
        }
      </header>
    </div>
  );
}

export default App;
