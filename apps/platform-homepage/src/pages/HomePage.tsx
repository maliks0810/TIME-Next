import { gql } from '@apollo/client';
import { useBasicGQLOperation, useUserInfo } from '@platform/utils';
import { Card, CardContent, CardMedia, IconButton, Paper, Stack, Typography } from '@mui/material';

import blueUpRightArrow from '../assets/noun-right-up-100x100-tcw-blue.png';
// import tcwMainPicture from '../assets/tcwMainPicture.jpg';
import tcwTestMain from '../assets/Picture1.png';
import '../App.scss';
import { useEffect, useState } from 'react';
import BookmarksOutlinedIcon from '@mui/icons-material/BookmarksOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import OkSVG from '../assets/check_circle.svg?react';
import ErrorSVG from '../assets/report.svg?react';


export const GET_DESKS_STATUS = gql`
    query AllDesksStatus {
        allDesksStatus {
            timestamp
            desks {
                id
                name
                label
                description
                dashboard
                trading
                portfolio {
                    construction
                    exploration
                    management
                }
            }
        }
    }
`;

export type DeskCapability = {
    id: string;
    name: string;
    label: string;
    description: string;
    portfolio: PortfolioCapability;
    dashboard: boolean;
    trading: boolean;
};

export type PortfolioCapability = {
    construction: boolean;
    exploration: boolean;
    management: boolean;
};

export const createDeskStatusMark = (normal?: boolean) => {
    return normal ? (
        <OkSVG className="desk-status-mark status-mark-normal" />
    ) : (
        <ErrorSVG className="desk-status-mark status-mark-abnormal" />
    );
};

const HomePage: React.FC = () => {
  const apolloOp = useBasicGQLOperation();
	const [deskStatuses, setDeskStatuses] = useState<DeskCapability[]>([]);

	    useEffect(() => {
        apolloOp(GET_DESKS_STATUS)
            .then((results) => {
                if (results?.data?.allDesksStatus?.desks) {
                    setDeskStatuses(results?.data?.allDesksStatus?.desks);
                }
            })
            .catch((err) => {
                console.log('Error getting Desk Statuses:', err);
            });
    }, [apolloOp]);
	console.log(deskStatuses);
    const userInfo = useUserInfo();

  return (
    <div className="dashboard-container">
		<div className="dashboard-time">
			<span>
				{'As of ' + new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
			</span>
		</div>
      <Stack direction="row" spacing={2} flexGrow={1}>
        <Stack direction="column" spacing={1} sx={{ width: '70%' }}>
          <Card variant="outlined">
                <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #23425C, #A3C0C7)',
                    }}>
                </CardMedia>
                <div style={{lineHeight: 0}}>
                  <img src={tcwTestMain} alt="TCW Main Picture" width="100%" ></img>
                  <div className="banner">
                    <div className="text-container">
						<h1 className="title">TIME</h1> 
						<p className="subtitle">TCW Investment Management Engine</p> 
					</div> 
					</div> 
                </div>
            
          </Card>
          <Paper elevation={0} sx={{background: '#F9F9F9'}}>
            <CardContent  sx={{pb: "0px", pt: "0px"}}><h2>Key Features</h2></CardContent>
             <Stack direction="row" spacing={3} flexGrow={1}>
              <Card sx={{width: '100%'}}>
                <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #375431, #B2C685)',
                    }}></CardMedia>
                    <CardContent >
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ padding: '10px' }}>
                          Centralized Platform
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', padding: '10px' }}>
                        One hub for all your <br />
                        investment tools and <br /> workflows

                      </Typography>
                    </CardContent>

              </Card>

              <Card sx={{width: '100%'}} >
                <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #75375B, #DBD4D5)',
                    }}></CardMedia>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ padding: '10px' }}>
                          Portfolio Management
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', padding: '10px' }}>
                        Simplify allocation and track <br />
                        performance effortlessly

                      </Typography>
                    </CardContent>
              </Card>

              <Card sx={{width: '100%'}}>
                <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #977935, #E4E3E1)',
                    }}></CardMedia>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ padding: '10px' }}>
                          Risk Analytics
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', padding: '10px' }}>
                        Gain actionable insights to <br />
                        manage exposure <br />
                        confidently

                      </Typography>
                    </CardContent>
              </Card>
              <Card sx={{width: '100%'}}>
                <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #23425C, #A3C0C7)',
                    }}></CardMedia>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ padding: '10px' }}>
                        Compliance & Reporting
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', padding: '10px' }}>
                        Ensure regulatory adherence <br />
                        and generate reports with <br />
                        confidence

                      </Typography>
                    </CardContent>
              </Card>
             </Stack>

          </Paper>
        </Stack>

        <Card variant="outlined"  sx={{ width: '30%' }}>
          <CardMedia
                    component="div"
                    sx={{
                      height: 6,
                      backgroundImage: 'linear-gradient(to right, #0D0D0D, #23425C, #A3C0C7)',
                    }}>
          </CardMedia>
          <CardContent sx={{pl: "20px", pb: "0px"}}>
                <Typography gutterBottom variant="h5" component="div">
                  Quick View
                </Typography>
          </CardContent>
          <Stack direction="column" sx={{pl: "20px", pt: "10px", pr: "20px"}} spacing={4} flexGrow={1} justifyContent="center">
            <Card sx={{background: '#F9F9F9'}}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" component="div" style={{paddingBottom: "15px"}}>
                        <IconButton size="small" disableFocusRipple disableRipple>
                          <BookmarksOutlinedIcon/>
                        </IconButton>
                  <span className='quick-view-card-title'>
                    Frequently Visited Pages
                  </span>
                </Typography>
					{(userInfo.favorites ?? [])
						.sort((a, b) => (a.clickCount < b.clickCount ? 1 : -1))
						.slice(0, 7)
						.map((fav, i) => (
							<div className="quick-view-link-container" key={i}>
								<button
									className="quick-view-link"
									// onClick={() => popupRef.current.showPopup(fav)}
								>
									{fav.title}
								</button>
								{fav.newTab && (
									<img
										src={blueUpRightArrow}
										alt="blueUpRightArrow"
										className="link-action-arrow"
									/>
								)}
							</div>  
						))}  
              </CardContent>
            </Card>
            <Card sx={{background: '#F9F9F9'}}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" component="div" style={{paddingBottom: "15px"}}>
                                          <IconButton size="small" disableFocusRipple disableRipple>
                                            <CheckCircleOutlineOutlinedIcon />
                                          </IconButton>
                  <span className='quick-view-card-title'>
                    Statuses
                  </span>

                </Typography>
				    <div>
						<span style={{paddingLeft: "5px", color: '#003e7e'}}>
                    		TIME Platform Status
                  		</span>
                {/* title="Start of Day Business Events"
                status={allDesksNormal ? 'Normal' : 'Abnormal'}
            > */}
                {/* <div className="service-desk-header">
                    <div className="status-desk-row-header desk-header-name">Name</div>
                    <div className="status-desk-row-header desk-header-dashboard">Dashbrd</div>
                    <div className="status-desk-row-header desk-header-trading">Trading</div>
                    <div className="status-desk-row-header desk-header-pfconstruction">
                        Pf Const
                    </div>
                    <div className="status-desk-row-header desk-header-pfexploration">Pf Expl</div>
                    <div className="status-desk-row-header desk-header-pfmanagement">Pf Mgmt</div>
                    <div className="status-desk-row-header desk-header-description">
                        Description
                    </div>
                </div> */}
                {/* {deskStatuses.map((s, i) => (
                    <div className="status-desk-row" key={i}>
                        <div className="status-desk-row-field desk-field-name">{s.name}</div>
                        <div className="status-desk-row-field desk-field-dashboard">
                            {createDeskStatusMark(s.dashboard)}
                        </div>
                        <div className="status-desk-row-field desk-field-trading">
                            {createDeskStatusMark(s.trading)}
                        </div>
                        <div className="status-desk-row-field desk-field-pfconstruction">
                            {createDeskStatusMark(s.portfolio?.construction)}
                        </div>
                        <div className="status-desk-row-field desk-field-pfexploration">
                            {createDeskStatusMark(s.portfolio?.exploration)}
                        </div>
                        <div className="status-desk-row-field desk-field-pfmanagement">
                            {createDeskStatusMark(s.portfolio?.management)}
                        </div>
                        <div className="status-desk-row-field desk-field-description">
                            {s.description}
                        </div>
                    </div>
                ))} */}
            </div>
              </CardContent>
            </Card>
            <Card sx={{background: '#F9F9F9'}}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold" component="div" style={{paddingBottom: "15px"}}>
                  <IconButton size="small" disableFocusRipple disableRipple>
                    <InfoOutlinedIcon />
                  </IconButton>
                  <span className='quick-view-card-title'>
                   TCW TIME Announcement
                  </span>
                </Typography>
                <Typography variant="body1" component="div" style={{paddingLeft: "5px"}}>
					<span style={{fontSize: '14px', color: '#007DAA', fontWeight: '550'}}>
						{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
					</span>
					<br />
					<span >
						Welcome to TIME 2.0.  This is a unified platform to host TCW applications.
					</span>
                   
                </Typography>
              </CardContent>
            </Card>

          </Stack>
        </Card>
      </Stack>
    </div>
  )
}

export default HomePage;