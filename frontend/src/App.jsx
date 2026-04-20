import { Routes, Route, Link } from 'react-router-dom';
import Page1 from './pages/page1';
import Page2 from './pages/page2';
import Page3 from './pages/page3';
import Page4 from './pages/page4';
import Page5 from './pages/page5';

function App() {
  return (
    <div>
      <nav style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '20px' }}>Курсы валют</Link>
        <Link to="/page2" style={{ marginRight: '20px' }}>Статистика кредитования</Link>
        <Link to="/page3" style={{ marginRight: '20px' }}>Денежные агрегаты</Link>
        <Link to="/page4" style={{ marginRight: '20px' }}>Ставки по депозитам</Link>
        <Link to="/page5" style={{ marginRight: '20px' }}>Ставки по кредитам</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Page1 />} />
        <Route path="/page2" element={<Page2 />} />
        <Route path="/page3" element={<Page3 />} />
        <Route path="/page4" element={<Page4 />} />
        <Route path="/page5" element={<Page5 />} />
      </Routes>
    </div>
  );
}

export default App;