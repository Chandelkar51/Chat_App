// import './App.css'
import Chat from './pages/chat'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/chats' element={<Chat />} />
    
      </Routes>
    </BrowserRouter>
  )
}

export default App;
