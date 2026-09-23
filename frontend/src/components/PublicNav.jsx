import { Link } from "react-router-dom";

export default function PublicNav() {
  return (
    <header className="public-nav">
      <Link to="/" className="wordmark">
        CampusVoice
      </Link>
      <Link to="/track" className="nav-link">
        Track a complaint
      </Link>
    </header>
  );
}
