import React, { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Card, CardMedia, Typography, Button, Grid, Box, Divider, Link } from '@mui/material';
import { CloseSharp, FileCopy, Delete, DescriptionOutlined } from '@mui/icons-material';
import { IDashboardSecuritySetupRequest } from '../lib/DashboardSecuritySetupRequest'
import { formatDate } from '../../../utils/DateTimeHelper';
import '../lib/dashboard.scss';
import { IDashboardDetailsDeleteParameters, IDuplicateSecuritySetupRequestParameters } from '../lib/DashboardSearchParameters';
import { deleteSecurityRequests, duplicateSecuritySetupRequest } from '../../../services/DashboardService';
import { useUserInfo } from '@platform/utils';
import { ConfirmationModal } from '../../../common/components/ConfirmationModal';
import { INormalizedReferenceData, ReferenceDataFieldKey } from '../../../pages/security-setup/lib/types/referenceDataTypes';
import { useIdentityStore } from '../../../stores/useIdentityStore';

type DashboardRequestDetailsProps = {
  securityRequest: IDashboardSecuritySetupRequest | undefined;
  setIsRequestDetailsOpen: Dispatch<SetStateAction<boolean>>;
  referenceData: INormalizedReferenceData | null;
}

const DashboardRequestDetails: React.FC<DashboardRequestDetailsProps> = ({
  securityRequest,
  setIsRequestDetailsOpen,
  referenceData
}) => {
  const navigate = useNavigate();
  const [isDuplicateConfirmationOpen, setIsDuplicateConfirmationOpen] = useState<boolean>(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState<boolean>(false);
  const { name: currentUser } = useUserInfo();
  const userIdentity = useIdentityStore((s) => s.userIdentity);
  const userCanCancelRequest = userIdentity?.permissionsAllowed?.cancel_request || false;
  const userCanCancelRequestAfterSubmission = userIdentity?.permissionsAllowed?.cancel_request_after_submission || false;
  const userCanDuplicateRequest = userIdentity?.permissionsAllowed?.duplicate_request || false;

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

  const isUpdateButtonDisabled = () => {
    return securityRequest.setupStatus === 'Cancelled'
  }

  const isDuplicateButtonDisabled = () => {
    if (securityRequest.setupStatus === 'Request Initiated' ||
      securityRequest.setupStatus === 'Pending DM SSAP Review' ||
      securityRequest.setupStatus === 'Cancelled' ||
      securityRequest.setupStatus === 'Pending Trader Details' ||
      userCanDuplicateRequest === false
    ) {
      return true;
    }

    return false;
  }

  const isCancelButtonDisabled = () => {
    if (
      userCanCancelRequestAfterSubmission === true &&
      securityRequest.setupStatus !== 'Cancelled'
    ) {
        return false;
    }

    if (
      securityRequest.setupStatus === 'Cancelled' ||
      securityRequest.setupStatus === 'Request Submitted' ||
      securityRequest.setupStatus === 'Security Review Complete' ||
      securityRequest.setupStatus === 'Security Setup Complete' ||
      securityRequest.setupStatus === 'Ready for Trading' ||
      userCanCancelRequest === false
    ) {
      return true;
    }
    return false;
  }

  const handleCancelOnClick = () => {
    // open confirmation
    setIsCancelConfirmationOpen(true);
  }

  const handleCancelConfirmationClose = () => {
    // close confirmation
    setIsCancelConfirmationOpen(false);
  }

  const handleCancelConfirmationConfirm = async () => {
    const currentCancelParameters: IDashboardDetailsDeleteParameters = {
      securitySetupRequestId: securityRequest.id.toString(),
      updatedBy: currentUser ?? '',
    };

    try {
      await deleteSecurityRequests(currentCancelParameters);
    }
    catch (error) {
      if (error instanceof Error) {
        throw new Error(`DuplicateSecuritySetupRequest: ${error.message}`);
      }
      throw error;
    }
    finally {
      // close confirmation
      setIsCancelConfirmationOpen(false);
    }
  };

  const handleDuplicateOnClick = () => {
    // open confirmation
    setIsDuplicateConfirmationOpen(true);
  };

  const handleDuplicateConfirmationClose = () => {
    // close confirmation
    setIsDuplicateConfirmationOpen(false);
  };

  const handleDuplicateConfirmationConfirm = async () => {
    const parameters: IDuplicateSecuritySetupRequestParameters = {
      securitySetupRequestId: securityRequest.id,
      userName: currentUser ?? '',
    };

    try {
      await duplicateSecuritySetupRequest(parameters);
    }
    catch (error) {
      if (error instanceof Error) {
        throw new Error(`DuplicateSecuritySetupRequest: ${error.message}`);
      }
      throw error;
    }
    finally {
      // close confirmation
      setIsDuplicateConfirmationOpen(false);
    }
  }

  const lookupReferenceDataDescription = (key: string, value: string) => {
    let description: string | undefined = value;

    const data = referenceData?.byKey[key];

    if (data) {
      if (data.fieldDropdownValues) {
        const fieldDropdown = data.fieldDropdownValues.find(field => field.fieldDropdownValue === value);
        if (fieldDropdown) {
          description = fieldDropdown.fieldDropdownDescription;
        }
      }
    }

    return description;
  };

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
                <Button onClick={handleReviewRequestClick} className='tcw-button-outlined' variant='outlined' disabled={isUpdateButtonDisabled()}>
                  <FileCopy sx={{ padding: '0px 5px 0px 0px' }} />Update
                </Button>
              </Grid>
              <Grid>
                <Button onClick={handleDuplicateOnClick} className='tcw-button-outlined' variant='outlined' disabled={isDuplicateButtonDisabled()}><FileCopy sx={{ padding: '0px 5px 0px 0px' }} />Duplicate</Button>
              </Grid>
              <Grid>
                <Button onClick={handleCancelOnClick} className='tcw-button-outlined' variant='outlined' disabled={isCancelButtonDisabled()}><Delete sx={{ padding: '0px 5px 0px 0px' }} />Cancel</Button>
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
                          <Link
                            href={securityRequestDocument.sharepointWebUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="upload-link"
                          >
                            {securityRequestDocument.fileName}
                          </Link>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
              <b>Date Requested:</b> {formatDate(securityRequest.createdDate)}
            </Typography>
            <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
              <b>Requested By:</b> {securityRequest.createdBy}
            </Typography>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Typography variant="subtitle2" sx={{ minWidth: 0, wordBreak: "break-word" }}>
              <b>{securityRequest.securityRequestDetails.identifierType}:</b> {securityRequest.securityRequestDetails.identifierValue}
            </Typography>
            <Typography variant="subtitle2" sx={{ maxWidth: "50%", wordBreak: "break-word" }}>
              <b>SSAP Password:</b> {securityRequest.securityRequestDetails.ssapIdPassword}
            </Typography>
            <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
              <b>Market Sector:</b> {securityRequest.securityRequestDetails.marketSectorType}
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
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.aladdinCdiId}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Description
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.description}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Tranche
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.tranche}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  New Issue
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.isNewIssue}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  EU Securitization TIP ID
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.euSecuritizationTipEuId}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Call Date
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {formatDate(securityRequest.securityRequestDetails.callDate)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Price
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestDetails.price}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Callable
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {
                    lookupReferenceDataDescription(
                      ReferenceDataFieldKey.Callable,
                      securityRequest.securityRequestDetails.callableValue
                  )}
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
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.IsTotalESGTCW, securityRequest.securityRequestEsgFields.tcwEsg)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  ESG Collateral Type <span className='red-text'>(CLO Only)</span>
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestEsgFields.esgCollateralType}
                </Typography>
              </Grid>
              <Grid size={2}>
                <Typography variant="caption" flex={1}>
                  TCW ESG Type
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
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
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.Slicer, securityRequest.securityRequestTradeFields.slicerType)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Type
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.MBS, securityRequest.securityRequestTradeFields.mbsType)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Loan Credit
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.LoanCreditType, securityRequest.securityRequestTradeFields.loanCredit)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Collateral
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.MBSCollateral, securityRequest.securityRequestTradeFields.mbsCollateral)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  MBS Collateral Sub
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.MBSCollateralSub, securityRequest.securityRequestTradeFields.mbsCollateralSub)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Sr. Most Cash Flow
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.SrMostCashFlow, securityRequest.securityRequestTradeFields.srMostCashFlow)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Tranche Type
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.Tranche, securityRequest.securityRequestTradeFields.trancheType)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Loan Category
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.SMSLoanCategory, securityRequest.securityRequestTradeFields.loanCategory)}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption" flex={1}>
                  Collateral
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {lookupReferenceDataDescription(ReferenceDataFieldKey.Collateral, securityRequest.securityRequestTradeFields.collateral)}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                <b>Intex Fields</b>
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={2} spacing={1}>
              <Grid size={1}>
                <Typography variant="caption">
                  Intex Deal Name
                </Typography>
                <Typography variant="subtitle2" flex={1} sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestIntexFields.intexDealName}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Intex Password
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestIntexFields.intexPassword}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Deal Name
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestIntexFields.dealName}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1" flex={1}>
                <b>ARC Field</b>
              </Typography>
            </Grid>
            <Grid container flexDirection={'row'} columns={2} spacing={1}>
              <Grid size={1}>
                <Typography variant="caption">
                  Prepayment Type Value
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.prepaymentTypeValue}
                </Typography>
              </Grid>

              <Grid size={1}>
                <Typography variant="caption">
                  Default Type Value
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.defaultTypeValue}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Prepayment Speed
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.prepaymentSpeed}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Default Speed
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.defaultSpeed}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Severity
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.severity}
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography variant="caption">
                  Delinquency
                </Typography>
                <Typography variant="subtitle2" sx={{ wordBreak: "break-word" }}>
                  {securityRequest.securityRequestArcFields.delinquency}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          <Divider flexItem />

          <Grid>
            <Grid>
              <Typography variant="subtitle1">
                <b>Notes / Instructions</b>
              </Typography>
              <Typography variant="subtitle2" sx={{ maxWidth: "95%", wordBreak: "break-word" }}>
                {securityRequest.noteInstructions}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Box>
      <ConfirmationModal
        header={"Duplicate Security Setup Request"}
        body={"Are you sure you want to duplicate this Security Setup Request?"}
        open={isDuplicateConfirmationOpen}
        onClose={handleDuplicateConfirmationClose}
        onConfirm={handleDuplicateConfirmationConfirm}
      />
      <ConfirmationModal
        header={"Cancel Security Setup Request"}
        body={"Are you sure you want to cancel this Security Setup Request?"}
        open={isCancelConfirmationOpen}
        onClose={handleCancelConfirmationClose}
        onConfirm={handleCancelConfirmationConfirm}
      />
    </>
  )
}

export default DashboardRequestDetails;
