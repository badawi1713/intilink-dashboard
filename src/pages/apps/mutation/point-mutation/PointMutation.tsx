import CloseIcon from '@mui/icons-material/Close';
import { DialogContent, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
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
import EmptyTableView from 'src/components/empty-table-view';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { handleGetPointMutationData } from 'src/store/actions/mutation-action/point-mutation-action';
import {
  setPointMutationLimit,
  setPointMutationPage,
  setPointMutationResetDetailData,
  setPointMutationResetState,
  setPointMutationSearchData,
  setPointMutationSortBy,
  setPointMutationSortType,
} from 'src/store/slices/mutation-slice/point-mutation-slice';
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
  keterangan: string;
  afiliasi: number;
  debet_id: number;
  debet_name: string;
  kredit_id: number;
  kredit_name: string;
  tanggal: string;
  poin: number;
}

function createData(
  id: number,
  keterangan: string,
  afiliasi: number,
  debet_id: number,
  debet_name: string,
  kredit_id: number,
  kredit_name: string,
  tanggal: string,
  poin: number,
): Data {
  return {
    id,
    keterangan,
    afiliasi,
    debet_id,
    debet_name,
    kredit_id,
    kredit_name,
    tanggal,
    poin,
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
    id: 'afiliasi',
    disablePadding: false,
    label: 'Afiliasi',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'poin',
    disablePadding: false,
    label: 'Poin',
    disableSort: false,
  },
  {
    id: 'debet_id',
    disablePadding: false,
    label: 'ID Debit',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'debet_name',
    disablePadding: false,
    label: 'Debit',
    disableSort: true,
  },
  {
    id: 'kredit_id',
    disablePadding: false,
    label: 'ID Kredit',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'kredit_name',
    disablePadding: false,
    label: 'Kredit',
    disableSort: true,
  },
  {
    id: 'tanggal',
    disablePadding: false,
    label: 'Tanggal',
    disableSort: true,
  },
  {
    id: 'keterangan',
    disablePadding: false,
    label: 'Keterangan',
    disableSort: true,
  },
  // {
  //   id: 'id',
  //   disablePadding: false,
  //   label: 'Action',
  //   align: 'center',
  //   disableSort: true,
  // },
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

const PointMutation = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loading, error, detailData } = useAppSelector(
    (state) => state.pointMutationReducer,
  );
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const handleClose = () => {
    setOpenDialog(false);
    dispatch(setPointMutationResetDetailData());
  };

  const handleGetData = useCallback(() => {
    dispatch(handleGetPointMutationData());
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
        dispatch(handleGetPointMutationData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data) =>
    createData(
      row?.id,
      row?.keterangan,
      row?.afiliasi,
      row?.debet_id,
      row?.debet_name,
      row?.kredit_id,
      row?.kredit_name,
      row?.tanggal,
      row?.poin,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';
      dispatch(setPointMutationSortBy(newOrderBy));
      dispatch(setPointMutationSortType(toggledOrder));

      dispatch(handleGetPointMutationData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(setPointMutationPage(newPage));
      dispatch(handleGetPointMutationData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPointMutationPage(0));
    dispatch(setPointMutationLimit(+event.target.value));

    dispatch(handleGetPointMutationData());
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
              dispatch(setPointMutationSearchData((e.target as HTMLInputElement).value))
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Daftar Mutasi Poin
            </Typography>
            <Typography variant="body1">Manajemen daftar mutasi poin</Typography>
          </div>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(setPointMutationResetState());
                dispatch(handleGetPointMutationData());
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
                        <TableRow hover tabIndex={-1} key={index}>
                          <TableCell align="center" component="th" id={labelId} scope="row">
                            {row.id}
                          </TableCell>
                          <TableCell align="center">{row.afiliasi ?? '-'}</TableCell>
                          <TableCell align="left">{row.poin ?? 0}</TableCell>
                          <TableCell align="center">{row.debet_id || '-'}</TableCell>
                          <TableCell align="left">{row.debet_name || '-'}</TableCell>
                          <TableCell align="center">{row.kredit_id || '-'}</TableCell>
                          <TableCell align="left">{row.kredit_name || '-'}</TableCell>
                          <TableCell align="left">{row.tanggal || '-'}</TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          {/* <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Detail">
                                <span>
                                  <IconButton
                                    disabled={loadingDetail}
                                    color="info"
                                    onClick={async () => {
                                      const response = await dispatch(
                                        handleGetPointMutationDetailData(row.id)
                                      );

                                      if (
                                        typeof response === 'boolean' &&
                                        response
                                      ) {
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
                            </section>
                          </TableCell> */}
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
          Detail Mutasi
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <section>
            <List dense>
              <ListItem>
                <ListItemText primary="ID" secondary={detailData?.id ?? '-'} />
              </ListItem>

              <ListItem>
                <ListItemText primary="Tanggal" secondary={detailData?.tanggal ?? '-'} />
              </ListItem>

              <ListItem>
                <ListItemText primary="Keterangan" secondary={detailData?.keterangan ?? '-'} />
              </ListItem>
            </List>
          </section>
        </DialogContent>
      </BootstrapDialog>
    </>
  );
};

export default PointMutation;
