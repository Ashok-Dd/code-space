import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import NewRoomRedirect from "./pages/NewRoomRedirect";
import EditorPage from "./pages/EditorPage";

function EditorRoute() {
  const { id } = useParams();
  return <EditorPage roomId={id} />;
}

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#161b22",
            color: "#f3f4f6",
            border: "1px solid rgba(139,92,246,0.3)",
            maxWidth: "calc(100vw - 32px)",
          },
        }}
        containerStyle={{ top: 12, right: 12, left: 12 }}
      />
      <Routes>
        <Route path="/" element={<NewRoomRedirect />} />
        <Route path="/:id" element={<EditorRoute />} />
      </Routes>
    </>
  );
}

export default App;
