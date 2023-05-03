import { yupResolver } from '@hookform/resolvers/yup';
import { CheckCircleOutline, History, Info } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { DialogContent, IconButton, List, ListItem, ListItemText, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  handleGetDepositData,
  handleGetDepositDetailData,
  handleGetDepositLogDetailData,
  manualDepositTransaction,
} from 'src/store/actions/transaction-action/deposit-action';
import {
  setDepositLimit,
  setDepositPage,
  setDepositResetDetailData,
  setDepositResetState,
  setDepositSearchData,
  setDepositSortBy,
  setDepositSortType,
} from 'src/store/slices/transaction-slice/deposit-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const menuSchema = yup.object().shape({
  nominal: yup.string().required('Title is required'),
  total_bayar: yup.string().required('Link is required'),
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

interface Data {
  id: number;
  nominal: number;
  admin_nominal: number;
  total_bayar: number;
  bank: string;
  kode_bayar: string;
  status_name: string;
  user_id: number;
  deleted: boolean;
  created_date: string;
  reff_id: string;
  expired_date?: string;
}

function createData(
  id: number,
  nominal: number,
  admin_nominal: number,
  total_bayar: number,
  bank: string,
  kode_bayar: string,
  status_name: string,
  user_id: number,
  deleted: boolean,
  created_date: string,
  reff_id: string,
  expired_date?: string,
): Data {
  return {
    id,
    nominal,
    admin_nominal,
    total_bayar,
    bank,
    kode_bayar,
    status_name,
    user_id,
    deleted,
    created_date,
    reff_id,
    expired_date,
  };
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  align?: 'left' | 'right' | 'center';
  disableSort: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    disablePadding: true,
    label: 'ID',
    align: 'center',
    disableSort: false,
  },
  {
    id: 'nominal',
    disablePadding: false,
    label: 'Nominal',
    disableSort: false,
  },
  {
    id: 'admin_nominal',
    disablePadding: false,
    label: 'Nominal Admin',
    disableSort: false,
  },
  {
    id: 'total_bayar',
    disablePadding: false,
    label: 'Total Bayar',
    disableSort: false,
  },
  {
    id: 'bank',
    disablePadding: false,
    label: 'Bank',
    disableSort: false,
  },
  {
    id: 'kode_bayar',
    disablePadding: false,
    label: 'Kode Bayar',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'status_name',
    disablePadding: false,
    label: 'Status',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'user_id',
    disablePadding: false,
    label: 'User ID',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'created_date',
    disablePadding: false,
    label: 'Created Date',
    disableSort: false,
  },
  {
    id: 'expired_date',
    disablePadding: false,
    label: 'Expired Date',
    disableSort: false,
  },
  {
    id: 'id',
    disablePadding: false,
    label: 'Action',
    align: 'center',
    disableSort: true,
  },
];

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (newOrderBy: keyof Data) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, newOrderBy);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.label}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {!headCell.disableSort ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {!headCell.disableSort && orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

type FormType = {
  id: number;
  nominal: number;
  user_id: null | { id: number; nominal: string };
  admin_nominal: number;
  total_bayar: number;
};

const Deposit = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    loading,
    error,
    loadingDetail,
    detailData,
    logDetailData,
    loadingPost,
  } = useAppSelector((state) => state.depositReducer);
  const isMount = useRef<boolean>(true);

  const responseLogDataJson = logDetailData?.response ? JSON.parse(logDetailData?.response) : '-';
  const responseLogData = JSON.stringify(responseLogDataJson, null, 2);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [openLogDialog, setOpenLogDialog] = useState<boolean>(false);
  const [openManualDepositConfirmation, setOpenManualDepositConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: 0,
      nominal: 0,
      user_id: null,
      admin_nominal: 0,
      total_bayar: 0,
    },
    resolver: yupResolver(menuSchema),
  });

  const { control, formState, handleSubmit, reset } = formMethods;
  const { errors } = formState;

  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClose = () => {
    setOpenDialog(false);
    dispatch(setDepositResetDetailData());
  };

  const handleLogDetailClose = () => {
    setOpenLogDialog(false);
    dispatch(setDepositResetDetailData());
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const handleGetData = useCallback(() => {
    dispatch(handleGetDepositData());
  }, [dispatch]);

  useEffect(() => {
    if (isMount.current) {
      handleGetData();
      isMount.current = false;
    }
  }, [handleGetData]);

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        dispatch(handleGetDepositData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data) =>
    createData(
      row?.id,
      row?.nominal,
      row?.admin_nominal,
      row?.total_bayar,
      row?.bank,
      row?.kode_bayar,
      row?.status_name,
      row?.user_id,
      row?.deleted,
      row?.created_date,
      row?.reff_id,
      row?.expired_date,
    ),
  );

  const handleRequestSort = React.useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';
      dispatch(setDepositSortBy(newOrderBy));
      dispatch(setDepositSortType(toggledOrder));

      dispatch(handleGetDepositData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = React.useCallback(
    (event: unknown, newPage: number) => {
      dispatch(setDepositPage(newPage));
      dispatch(handleGetDepositData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setDepositPage(0));
    dispatch(setDepositLimit(+event.target.value));

    dispatch(handleGetDepositData());
  };

  const handleManualDepositData = async (id: string) => {
    const response = await dispatch(manualDepositTransaction(id));
    if (typeof response === 'boolean' && response) {
      dispatch(handleGetDepositData());
      setOpenManualDepositConfirmation(false);
      setSelectedId(null);
    }
  };

  return (
    <>
      <section className="p-4 bg-gray-200 w-full rounded-md">
        <div className="flex flex-col xl:flex-row gap-4">
          <input
            className="rounded-md px-3 py-2 border-2 border-gray-600 w-full"
            type="search"
            placeholder="Cari data..."
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              dispatch(setDepositSearchData((e.target as HTMLInputElement).value))
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Daftar Deposit
            </Typography>
            <Typography variant="body1">Manajemen daftar deposit</Typography>
          </div>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(setDepositResetState());
                dispatch(handleGetDepositData());
              }}
            />
          ) : rows?.length === 0 ? (
            <EmptyTableView />
          ) : (
            <Paper sx={{ width: '100%' }}>
              <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={'medium'}>
                  <EnhancedTableHead
                    order={sortType || 'asc'}
                    orderBy={sortBy || 'deleted'}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {rows?.map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow hover tabIndex={-1} key={row.id}>
                          <TableCell align="center" component="th" id={labelId} scope="row">
                            {row.id}
                          </TableCell>
                          <TableCell align="left">{currencyFormat(row.nominal ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.admin_nominal ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.total_bayar ?? 0)}</TableCell>
                          <TableCell align="left">{row.bank || '-'}</TableCell>
                          <TableCell align="center">{row.kode_bayar || '-'}</TableCell>
                          <TableCell align="center">{row.status_name || '-'}</TableCell>
                          <TableCell align="center">{row.user_id || '-'}</TableCell>

                          <TableCell align="left">{row.created_date || '-'}</TableCell>
                          <TableCell align="left">{row.expired_date || '-'}</TableCell>
                          <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Biller Log">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail || loadingPost}
                                    color="default"
                                    onClick={async () => {
                                      const response = await dispatch(handleGetDepositLogDetailData(row.reff_id));

                                      if (typeof response === 'boolean' && response) {
                                        setOpenLogDialog(true);
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <History fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Detail">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail || loadingPost}
                                    color="info"
                                    onClick={async () => {
                                      const response = await dispatch(handleGetDepositDetailData(row.id));

                                      if (typeof response === 'boolean' && response) {
                                        handleClickOpen();
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Info fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Deposit Manual">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail || loadingPost}
                                    color="success"
                                    onClick={() => {
                                      setSelectedId(row?.reff_id);
                                      setOpenManualDepositConfirmation(true);
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <CheckCircleOutline fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </section>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={total || 0}
                rowsPerPage={limit || 5}
                page={page || 0}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </section>
      </main>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={openDialog}
        maxWidth="sm"
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
          Detail Deposit
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <section>
            <List dense>
              <ListItem>
                <ListItemText primary="ID" secondary={detailData?.id ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Nominal" secondary={currencyFormat(detailData?.nominal ?? 0)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Nominal Admin" secondary={currencyFormat(detailData?.admin_nominal ?? 0)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Total bayar" secondary={currencyFormat(detailData?.total_bayar ?? 0)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Type Admin" secondary={detailData?.admin_type ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Bank" secondary={detailData?.bank ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Status" secondary={detailData?.status_name ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="User" secondary={detailData?.user_name ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="User ID" secondary={detailData?.user_id ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Created Date" secondary={detailData?.created_date ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Expired Date" secondary={detailData?.expired_date ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Biller" secondary={detailData?.biller ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Transaksi Biller ID" secondary={detailData?.biller_trx_id ?? '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Reff ID" secondary={detailData?.reff_id ?? '-'} />
              </ListItem>
            </List>
          </section>
        </DialogContent>
      </BootstrapDialog>
      <BootstrapDialog
        onClose={handleLogDetailClose}
        aria-labelledby="customized-dialog-title"
        open={openLogDialog}
        maxWidth="xl"
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleLogDetailClose}>
          Biller Log Deposit
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <section>
            <List dense>
              <ListItem>
                <ListItemText primary="Biller" secondary={logDetailData?.biller_nama || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tanggal" secondary={logDetailData?.response_date || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Request" secondary={logDetailData?.request || '-'} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Response" secondary={<pre>{responseLogData}</pre>} />
              </ListItem>
            </List>
          </section>
        </DialogContent>
      </BootstrapDialog>
      {openManualDepositConfirmation && (
        <Confirmation
          open={openManualDepositConfirmation}
          title={'Manual deposit?'}
          content={`Konfirmasi untuk melakukan deposit secara manual dengan reff id ${selectedId}.`}
          cancelActionHandler={() => setOpenManualDepositConfirmation(false)}
          confirmActionHandler={() => handleManualDepositData(selectedId || '')}
          loading={loadingPost || false}
          loadingText={'Memproses'}
          confirmActionText={'Ok'}
          cancelActionText={'Batal'}
          type="success"
        />
      )}
    </>
  );
};

export default Deposit;
