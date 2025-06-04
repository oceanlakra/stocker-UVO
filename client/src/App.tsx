import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { Analysis } from "@/pages/Analysis";
import { Comparison } from "@/pages/Comparison";
import { Prediction } from "@/pages/Prediction";
import { Login } from "@/pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="comparison" element={<Comparison />} />
          <Route path="prediction" element={<Prediction />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;