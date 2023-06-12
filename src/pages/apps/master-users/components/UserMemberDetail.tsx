import { FC, memo } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useAppSelector } from 'src/hooks/useAppSelector';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

type UserMemberDetailProps = {
  open: boolean;
  handleClose: () => void;
};

const UserMemberDetail: FC<UserMemberDetailProps> = ({ open, handleClose }) => {
  const { memberData } = useAppSelector((state) => state.masterUsersReducer);

  type DataType = {
    id: string;
    nama: string;
    level: string;
    no_wa: string;
    email: string;
  };

  function createData(data: DataType) {
    const { id, nama, level, no_wa, email } = data;
    return { id, nama, level, no_wa, email };
  }

  const rows =
    typeof memberData === 'object' ? (memberData?.length > 0 ? memberData?.map((item) => createData(item)) : []) : [];

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open} onClose={handleClose}>
      <DialogTitle>Member</DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">ID</StyledTableCell>
                <StyledTableCell align="left">Nama</StyledTableCell>
                <StyledTableCell align="center">Level</StyledTableCell>
                <StyledTableCell align="left">No. Whatsapp</StyledTableCell>
                <StyledTableCell align="left">Email</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.length > 0 ? (
                rows.map((row) => (
                  <StyledTableRow key={row.id}>
                    <StyledTableCell component="th" scope="row" align="center">
                      {row.id}
                    </StyledTableCell>
                    <StyledTableCell align="left">{row.nama}</StyledTableCell>
                    <StyledTableCell align="center">{row.level}</StyledTableCell>
                    <StyledTableCell align="left">{row.no_wa}</StyledTableCell>
                    <StyledTableCell align="left">{row.email}</StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell component="th" scope="row" align="center" colSpan={5}>
                    Data tidak tersedia
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(UserMemberDetail);
