import logo from './logo.svg';
import './App.css';
import VirtualTable from "./VirtualTable";
import MaterialTableVirtualized from "./component/MaterialTableVirtualized";
import MaterialTableBadCode from "./component/MaterialTableBadCode";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/*<VirtualTable />*/}
          <MaterialTableVirtualized />
        {/*  <MaterialTableBadCode />*/}
      </header>
    </div>
  );
}

export default App;
