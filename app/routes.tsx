import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Login } from "./components/Login";
import { Intro } from "./components/Intro";
import { Main } from "./components/Main";
import { PracticeSetup } from "./components/PracticeSetup";
import { PracticeQuestion } from "./components/PracticeQuestion";
import { PracticeResult } from "./components/PracticeResult";
import { MockTestSetup } from "./components/MockTestSetup";
import { MockTestQuestion } from "./components/MockTestQuestion";
import { MockTestResult } from "./components/MockTestResult";
import { SavedQuestions } from "./components/SavedQuestions";
import { Resources } from "./components/Resources";
import { Records } from "./components/Records";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Login },
      { path: "intro", Component: Intro },
      { path: "main", Component: Main },
      { path: "practice/setup", Component: PracticeSetup },
      { path: "practice/question", Component: PracticeQuestion },
      { path: "practice/result", Component: PracticeResult },
      { path: "mocktest/setup", Component: MockTestSetup },
      { path: "mocktest/question", Component: MockTestQuestion },
      { path: "mocktest/result", Component: MockTestResult },
      { path: "saved", Component: SavedQuestions },
      { path: "resources", Component: Resources },
      { path: "records", Component: Records },
    ],
  },
]);
