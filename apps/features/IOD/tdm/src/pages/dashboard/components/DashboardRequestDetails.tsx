import React, { Dispatch, SetStateAction, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'
import { Card, CardMedia, Typography, Button, Grid, Box, Divider } from '@mui/material';
import { CloseSharp, FileCopy, Delete, History, DescriptionOutlined, FileDownloadOutlined } from '@mui/icons-material';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import { formatDate } from '../../../utils/DateTimeHelper';
import '../lib/dashboard.scss';

type DashboardRequestDetailsProps = {
  securityRequest: IDashboardSecuritySetupRequest | undefined;
  setIsRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
}

const DashboardRequestDetails: React.FC<DashboardRequestDetailsProps> = ({ securityRequest, setIsRequestDetailsOpen }) => {
  const navigate = useNavigate();

  // TODO: call service to load SecuritySetupRequest on open of Request Details

  const closeRequestDetails = useCallback(() => {
    setIsRequestDetailsOpen(false);
  }, [setIsRequestDetailsOpen]);

  const handleReviewRequestClick = () => {
    if (!securityRequest) {
      throw Error('No security request found.')
    }

    navigate(`/iod/tdm/security-setup?id=${securityRequest.id}`)
  }

  if (!securityRequest) {
    return <></>
  }

  return (
    <>
      <Box sx={{ width: '550px', padding: '2em', marginTop: '70px' }}>
        <Grid container flexDirection={'column'} spacing={2}>
          <Grid container flexDirection={'row'} justifyContent='space-between'>
            <Grid>
              <Typography variant="h6">
                Request Details
              </Typography>
            </Grid>
            <Grid>
              <Button
                variant='text'
                sx={{ color: 'black' }}
                onClick={closeRequestDetails}>
                <CloseSharp />
              </Button>
            </Grid>
          </Grid>
          <Grid>
            <Card elevation={0} sx={{ width: '100%' }}>
              <CardMedia
                component='div'
                className='dashboard-card-media'>
              </CardMedia>
            </Card>
          </Grid>
          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                Actions
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} spacing={1}>
              <Grid>
                <Button className='tcw-button-outlined' variant='outlined' onClick={handleReviewRequestClick}><FileCopy sx={{ padding: '0px 5px 0px 0px' }} />Update</Button>
              </Grid>
              <Grid>
                <Button className='tcw-button-outlined' variant='outlined'><FileCopy sx={{ padding: '0px 5px 0px 0px' }} />Duplicate</Button>
              </Grid>
              <Grid>
                <Button className='tcw-button-outlined' variant='outlined'><Delete sx={{ padding: '0px 5px 0px 0px' }} />Cancel</Button>
              </Grid>
              <Grid>
                <Button className='tcw-button-outlined' variant='outlined'><History sx={{ padding: '0px 5px 0px 0px' }} />View History</Button>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1">
                Next Steps
              </Typography>
            </Grid>
            <Grid container flexDirection={'column'} spacing={1}>
              <Grid>
                <Button className='tcw-button' variant='contained' sx={{ width: '100%' }} onClick={handleReviewRequestClick}>Review Request</Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid>
            <Typography variant="subtitle2">
              <b>Date Requested:</b> {formatDate(securityRequest.createdDate)}
            </Typography>
            <Typography variant="subtitle2">
              <b>Requested By:</b> {securityRequest.createdBy}
            </Typography>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Typography variant="subtitle2">
              <b>{securityRequest.securityRequestDetails.identifierType}:</b> {securityRequest.securityRequestDetails.identifierValue}
            </Typography>
            <Typography variant="subtitle2">
              <b>Private Deal:</b> {securityRequest.securityRequestDetails.isPrivateDeal}
            </Typography>
            <Typography variant="subtitle2">
              <b>SSAP Password:</b> {securityRequest.securityRequestDetails.ssapIdPassword}
            </Typography>
            <Typography variant="subtitle2">
              <b>Market Sector:</b> {securityRequest.securityRequestDetails.marketSectorType}
            </Typography>
            <Typography variant="subtitle2">
              <b>Yellow Key:</b> {securityRequest.securityRequestDetails.yellowKey}
            </Typography>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1">
                <b>Security Details</b>
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={2} spacing={1}>
              <Grid size={1}>
                <Typography variant="caption">
                  Aladdin CDI ID
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.aladdinCdiId}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  CUSIP
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.cusip}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Description
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.description}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Tranche
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.tranche}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  New Issue
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.isNewIssue}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  EU Security
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.isEuSecuritizationRequired}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  EU Securitization TIP ID
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.euSecuritizationTipEuId}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Call Date
                </Typography>
                <Typography variant="subtitle2">
                  {formatDate(securityRequest.securityRequestDetails.callDate)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Price
                </Typography>
                <Typography variant="subtitle2">
                  {securityRequest.securityRequestDetails.price}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                <b>ESG Fields</b>
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={2} spacing={1}>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  TCW ESG
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestEsgFields.tcwEsg}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  ESG Collateral Type <span className='red-text'>(CLO Only)</span>
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestEsgFields.esgCollateralType}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography variant="caption" flex={1}>
                  TCW ESG Type
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestEsgFields.tcwEsgType}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                <b>Trade Fields</b>
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={2} spacing={1}>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Slicer Type
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.slicerType}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Type
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.mbsType}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Loan Credit
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.loanCategory}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Collateral
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.mbsCollateral}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Collateral Sub
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.mbsCollateralSub}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Sr. Most Cash Flow
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.srMostCashFlow}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Tranche Type
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.trancheType}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Loan Category
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.loanCategory}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Collateral
                </Typography>
                <Typography variant="subtitle2" flex={1}>
                  {securityRequest.securityRequestTradeFields.collateral}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                Documents
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={1} spacing={1}>
              {securityRequest.securityRequestDocuments.map(securityRequestDocument => (
                <Grid key={securityRequestDocument.id} size={1}>
                  <Box className='security-request-file-container'>
                    <Grid container flexDirection={'row'} spacing={1}>
                      <Grid alignContent={'center'}>
                        <DescriptionOutlined />
                      </Grid>
                      <Grid >
                        <Grid>
                          <Typography variant="subtitle2" flex={1}>
                            {securityRequestDocument.fileName}
                          </Typography>
                        </Grid>
                        <Grid alignContent={'center'}>
                          <Typography variant="caption" flex={1}>
                            {securityRequestDocument.filePath}
                          </Typography>
                        </Grid>
                      </Grid>
                      <Grid alignContent={'center'} sx={{ ml: 'auto' }}>
                        <Button className='tcw-button-text' variant='text'>
                          <FileDownloadOutlined sx={{ padding: '0px 5px 0px 0px' }} />Download
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

        </Grid>
      </Box>
    </>
  )
}

export default DashboardRequestDetails;
