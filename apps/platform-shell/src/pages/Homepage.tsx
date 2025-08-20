// import todImg from '../assets/tod.png';
// import trapImg from '../assets/analytics.png';
// import tipImg from '../assets/pencil.png';
// import reportSVG from '../assets/report-2.svg';
// import statusSVG from '../assets/monitor_heart.svg';
// import favoritesSVG from '../assets/favorites-svgrepo-com.svg';
// import blueUpRightArrow from '../assets/noun-right-up-100x100-tcw-blue.png';
// import status from '../assets/screenshot-status.png';
// import './Homepage.module.scss'

export const HomePage: React.FC = () => {
  return (
    <div className="dashboard-container">  
    <div className="left-panel">
    <div className="block-container">
            <div className="block-top" />
            <div className="block-inner-container">
                <div className="block-title">As of {new Date().toDateString()}</div>
                <div className="ttt_container">
            <button
                className="ttt_button trap_button"
            >
                {/* <img alt="trap" className="ttt_image trap_image" src={trapImg} /> */}
                <div className="ttt_button_text">Risk Analytics Portal</div>
            </button>
            <button
                className="ttt_button tod_button"
            >
                {/* <img alt="tod" className="ttt_image tod_image" src={todImg} /> */}
                <div className="ttt_button_text">Operational Data</div>
            </button>
            <button
                className="ttt_button tip_button"
            >
                {/* <img alt="tip" className="ttt_image tip_image" src={tipImg} /> */}
                <div className="ttt_button_text">Intelligent Platform</div>
            </button>
        </div>
            </div>
        </div>
    </div>  
    <div className="right-panel">
    <div className="block-container">
            <div className="block-top" />
            <div className="block-inner-container">
                <div className="block-title">Quick View</div>
                <div className="ttt_container"> 
            <div className="quick-view-card-insert">
                    <div className="quick-view-insert-title-container">

                            {/* <img
                                src={reportSVG}
                                alt="title icon"
                                className="quick-view-insert-icon"
                            /> */}
                        <div className="quick-view-insert-title">Reports</div>
                    </div>
                    <div className="quick-view-link-container">
                    <a
                        className="quick-view-link"
                    >
                        TCW Report Directory
                    </a>
                        {/* <img
                            src={blueUpRightArrow}
                            alt="blueUpRightArrow"
                            className="link-action-arrow"
                        /> */}

                </div>
            </div>
            <div className="quick-view-card-insert">
                    <div className="quick-view-insert-title-container">

                            {/* <img
                                src={favoritesSVG}
                                alt="title icon"
                                className="quick-view-insert-icon"
                            /> */}
                        <div className="quick-view-insert-title">Frequently Visited Pages</div>
                    </div>
                    <div className="quick-view-link-container">
                    <a
                        className="quick-view-link"
                    >
                        TIP
                    </a>
                        {/* <img
                            src={blueUpRightArrow}
                            alt="blueUpRightArrow"
                            className="link-action-arrow"
                        /> */}

                </div>
                <div className="quick-view-link-container">
                    <a
                        className="quick-view-link"
                    >
                        Recon TODvsTDC
                    </a>
                        {/* <img
                            src={blueUpRightArrow}
                            alt="blueUpRightArrow"
                            className="link-action-arrow"
                        /> */}

                </div>
                <div className="quick-view-link-container">
                    <a
                        className="quick-view-link"
                    >
                        TOD
                    </a>
                        {/* <img
                            src={blueUpRightArrow}
                            alt="blueUpRightArrow"
                            className="link-action-arrow"
                        /> */}

                </div>
            </div>
            <div className="quick-view-card-insert">
                    <div className="quick-view-insert-title-container">

                            {/* <img
                                src={statusSVG}
                                alt="title icon"
                                className="quick-view-insert-icon"
                            /> */}
                        <div className="quick-view-insert-title">Statuses</div>
                    </div>
                    {/* <img    
                                src={status}
                                alt="title icon"
                                className="status-screenshot"
                            /> */}
            </div>
        </div>
            </div>
        </div>

    </div>  
</div>  
  )
}
