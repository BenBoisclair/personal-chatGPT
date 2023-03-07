import './App.css';
import './normal.css';
import PersonalAssistant from './components/PersonalAssistant';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import AuthDetails from './components/AuthDetails';


function App() {
  return (
    <div className="App">
      {/* <PersonalAssistant /> */}
      <SignIn/>
      {/* <SignUp/> */}
    </div>
  );
}

export default App;