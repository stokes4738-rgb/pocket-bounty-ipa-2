import { useState } from "react";
import { Layout } from "@/components/Layout";
import Bank from "./Bank";
import Board from "./Board";
import Post from "./Post";
import Messages from "./Messages";
import Profile from "./Profile";
import Friends from "./Friends";
import Activity from "./Activity";
import Settings from "./Settings";
import FlappyGame from "./FlappyGame";
import Account from "./Account";
import CreatorDashboard from "./CreatorDashboard";
import Referrals from "./Referrals";
import PointsStore from "./PointsStore";

export default function Home() {
  const [activeSection, setActiveSection] = useState("board");

  const renderSection = () => {
    switch (activeSection) {
      case "bank":
        return <Bank />;
      case "board":
        return <Board />;
      case "post":
        return <Post />;
      case "messages":
        return <Messages />;
      case "profile":
        return <Profile />;
      case "friends":
        return <Friends />;
      case "activity":
        return <Activity />;
      case "settings":
        return <Settings />;
      case "flappy":
        return <FlappyGame />;
      case "referrals":
        return <Referrals />;
      case "points":
        return <PointsStore />;
      case "account":
        return <Account />;
      case "admin":
        return <CreatorDashboard />;
      default:
        return <Board />;
    }
  };

  return (
    <Layout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderSection()}
    </Layout>
  );
}
