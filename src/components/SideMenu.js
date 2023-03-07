const SideMenu = () => {
    function clearChat() {
        // setChatHistory([...chatLog]);
        setChatLog([]);
      }

    return (
        <aside className="sidemenu">
            <div className="side-menu-button" onClick={clearChat}>
                <span>+</span>
                New Chat
            </div>
        </aside>
    )
}