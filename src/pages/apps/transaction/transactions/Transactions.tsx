import { History } from '@mui/icons-material';
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
import { ErrorView, Loading } from 'src/components';
import { Accordion, AccordionDetails, AccordionSummary } from 'src/components/accordion/Accordion';
import EmptyTableView from 'src/components/empty-table-view';
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  handleGetTransactionsData,
  handleGetTransactionsLogDetailData,
} from 'src/store/actions/transaction-action/transactions-action';
import {
  setTransactionsLimit,
  setTransactionsPage,
  setTransactionsResetDetailData,
  setTransactionsResetState,
  setTransactionsSearchData,
  setTransactionsSortBy,
  setTransactionsSortType,
} from 'src/store/slices/transaction-slice/transactions-slice';
import { useDebounce } from 'usehooks-ts';

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
  denom: number;
  type: string;
  status: string;
  keterangan: string;
  produk_name: string;
  id_pel: string;
  admin: number;
  harga_up: number;
  total_bayar: number;
  reff_id: string;
  created_date: string;
  harga_beli: number;
  index: number;
}

function createData(
  id: number,
  denom: number,
  type: string,
  status: string,
  keterangan: string,
  produk_name: string,
  id_pel: string,
  admin: number,
  harga_up: number,
  total_bayar: number,
  reff_id: string,
  created_date: string,
  harga_beli: number,
  index: number,
): Data {
  return {
    id,
    denom,
    type,
    status,
    keterangan,
    produk_name,
    id_pel,
    admin,
    harga_up,
    total_bayar,
    reff_id,
    created_date,
    harga_beli,
    index,
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
    id: 'denom',
    disablePadding: false,
    label: 'Denom',
    disableSort: false,
  },
  {
    id: 'type',
    disablePadding: false,
    label: 'Type',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'status',
    disablePadding: false,
    label: 'Status',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'keterangan',
    disablePadding: false,
    label: 'Keterangan',
    disableSort: false,
  },
  {
    id: 'produk_name',
    disablePadding: false,
    label: 'Produk',
    disableSort: false,
  },
  {
    id: 'id_pel',
    disablePadding: false,
    label: 'ID Pelanggan',
    disableSort: false,
  },
  {
    id: 'harga_beli',
    disablePadding: false,
    label: 'Harga Beli',
    disableSort: false,
  },
  {
    id: 'admin',
    disablePadding: false,
    label: 'Biaya Admin',
    disableSort: false,
  },
  {
    id: 'harga_up',
    disablePadding: false,
    label: 'Harga Up',
    disableSort: false,
  },
  {
    id: 'total_bayar',
    disablePadding: false,
    label: 'Total Bayar',
    disableSort: false,
  },
  {
    id: 'reff_id',
    disablePadding: false,
    label: 'Reff ID',
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
    id: 'index',
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

const Transactions = () => {
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
    logDetailData,
    loadingPost,
  } = useAppSelector((state) => state.transactionsReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openLogDialog, setOpenLogDialog] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleLogDetailClose = () => {
    setOpenLogDialog(false);
    dispatch(setTransactionsResetDetailData());
  };

  const handleGetData = useCallback(() => {
    dispatch(handleGetTransactionsData());
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
        dispatch(handleGetTransactionsData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data, index) =>
    createData(
      row?.id,
      row?.denom,
      row?.type,
      row?.status,
      row?.keterangan,
      row?.produk_name,
      row?.id_pel,
      row?.admin,
      row?.harga_up,
      row?.total_bayar,
      row?.reff_id,
      row?.created_date,
      row?.harga_beli,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';
      dispatch(setTransactionsSortBy(newOrderBy));
      dispatch(setTransactionsSortType(toggledOrder));

      dispatch(handleGetTransactionsData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(setTransactionsPage(newPage));
      dispatch(handleGetTransactionsData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setTransactionsPage(0));
    dispatch(setTransactionsLimit(+event.target.value));

    dispatch(handleGetTransactionsData());
  };

  const handleChangeAccordion = (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
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
              dispatch(setTransactionsSearchData((e.target as HTMLInputElement).value))
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Daftar Transaksi
            </Typography>
            <Typography variant="body1">Manajemen daftar transaksi</Typography>
          </div>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(setTransactionsResetState());
                dispatch(handleGetTransactionsData());
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
                          <TableCell align="left">{currencyFormat(row.denom ?? 0)}</TableCell>
                          <TableCell align="center">{row.type || '-'}</TableCell>
                          <TableCell align="center">{row.status || '-'}</TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          <TableCell align="left">{row.produk_name || '-'}</TableCell>
                          <TableCell align="left">{row.id_pel || '-'}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_beli ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.admin ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_up ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.total_bayar ?? 0)}</TableCell>
                          <TableCell align="center">{row.reff_id || '-'}</TableCell>
                          <TableCell align="left">{row.created_date || '-'}</TableCell>
                          <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Biller Log">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail || loadingPost}
                                    color="default"
                                    onClick={async () => {
                                      const response = await dispatch(handleGetTransactionsLogDetailData(row.reff_id));

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
        onClose={handleLogDetailClose}
        aria-labelledby="customized-dialog-title"
        open={openLogDialog}
        maxWidth="xl"
        fullWidth
      >
        <BootstrapDialogTitle id="customized-dialog-title" onClose={handleLogDetailClose}>
          Biller Log Transaksi
        </BootstrapDialogTitle>
        <DialogContent dividers>
          {logDetailData?.length > 0 && typeof logDetailData === 'object' ? (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            logDetailData?.map((log: any, index: number) => {
              const responseLogDataJson = log?.response ? JSON.parse(log?.response) : '-';
              const responseLogData = JSON.stringify(responseLogDataJson, null, 2);
              return (
                <Accordion
                  key={index}
                  expanded={expanded === `panel${index}`}
                  onChange={handleChangeAccordion(`panel${index}`)}
                >
                  <AccordionSummary aria-controls={`panel${index}-content`} id={`panel${index}-header`}>
                    <Typography>
                      Log {index + 1}: {log?.response_date}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails className="overflow-auto">
                    <List dense>
                      <ListItem>
                        <ListItemText primary="Biller" secondary={log?.biller_nama || '-'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Tanggal" secondary={log?.response_date || '-'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Request" secondary={log?.request || '-'} />
                      </ListItem>
                      <ListItem>
                        <ListItemText primary="Response" secondary={<pre>{responseLogData}</pre>} />
                      </ListItem>
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })
          ) : (
            <Typography variant="h6" textAlign="center">
              Data Log Tidak Tersedia
            </Typography>
          )}
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default Transactions;
