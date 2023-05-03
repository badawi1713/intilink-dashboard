import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit, Payment } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { FormControlLabel, IconButton, Switch, TextField, Tooltip, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
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
import { Controller, useForm } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewBillerData,
  changeMasterBillerReducer,
  deleteBillerData,
  editBillerData,
  getBillerDetailData,
  getBillerSaldoData,
  getMasterBillerData,
} from 'src/store/actions/masters-action/biller-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const billerSchema = yup.object().shape({
  nama: yup.string().required('Biller name is required'),
  host: yup.string().required('Host is required'),
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
  nama: string;
  host: string;
  active: boolean;
  have_saldo: boolean;
  credential_1: string | null;
  credential_2: string | null;
  credential_3: string | null;
  index: number;
}

function createData(item: Data) {
  const { id, nama, host, active, have_saldo, credential_1, credential_2, credential_3, index } = item;
  return {
    id,
    nama,
    host,
    active,
    have_saldo,
    credential_1,
    credential_2,
    credential_3,
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
    disableSort: false,
    align: 'center',
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Biller',
    disableSort: false,
  },
  {
    id: 'host',
    disablePadding: false,
    label: 'Host',
    disableSort: false,
  },
  {
    id: 'credential_1',
    disablePadding: false,
    label: 'Credential 1',
    disableSort: false,
  },
  {
    id: 'credential_2',
    disablePadding: false,
    label: 'Credential 2',
    disableSort: false,
  },
  {
    id: 'credential_3',
    disablePadding: false,
    label: 'Credential 3',
    disableSort: false,
  },
  {
    id: 'active',
    disablePadding: false,
    label: 'Active',
    disableSort: true,
    align: 'center',
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

type FormType = {
  id: string;
  nama: string;
  host: string;
  credential1: string;
  credential2: string;
  credential3: string;
  active: boolean;
};

const Biller = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    billerSaldo,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    loadingPost,
    loadingDelete,
    loading,
    error,
  } = useAppSelector((state) => state.masterBillerReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openSaldoDialog, setOpenSaldoDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [selectedBiller, setSelectedBiller] = useState<string>('');
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      nama: '',
      host: '',
      credential1: '',
      credential2: '',
      credential3: '',
      active: true,
    },
    resolver: yupResolver(billerSchema),
  });

  const { control, formState, handleSubmit, reset } = formMethods;
  const { errors } = formState;

  const handleClickOpen = () => {
    setOpenFormDialog(true);
  };
  const handleClose = () => {
    if (editForm) {
      setEditForm(false);
    }
    setOpenFormDialog(false);
    reset({
      id: '',
      nama: '',
      host: '',
      credential1: '',
      credential2: '',
      credential3: '',
      active: true,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      id: formData.id,
      nama: formData.nama,
      host: formData.host,
      active: formData.active,
      credential_1: formData.credential1,
      credential_2: formData.credential2,
      credential_3: formData.credential3,
    };

    if (editForm) {
      const response = await dispatch(editBillerData(formData?.id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterBillerData());
      }
    } else {
      const response = await dispatch(addNewBillerData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterBillerData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterBillerData());
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
        dispatch(getMasterBillerData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((item, index) => createData({ ...item, index }));

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterBillerReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterBillerData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterBillerReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterBillerData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterBillerReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterBillerData());
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteBillerData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterBillerData());
      setOpenDeleteConfirmation(false);
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
              dispatch(
                changeMasterBillerReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              )
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Biller
            </Typography>
            <Typography variant="body1">Manajemen daftar biller</Typography>
          </div>
          <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
            Tambah Data
          </Button>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(
                  changeMasterBillerReducer({
                    page: 0,
                    sortBy: 'deleted',
                  }),
                );
                dispatch(getMasterBillerData());
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
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.host || '-'}</TableCell>
                          <TableCell align="left">{row.credential_1 || '-'}</TableCell>
                          <TableCell align="left">{row.credential_2 || '-'}</TableCell>
                          <TableCell align="left">{row.credential_3 || '-'}</TableCell>
                          <TableCell align="center">
                            {row.active ? (
                              <CheckCircleIcon titleAccess="Active" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Disable" fontSize="small" color="error" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <section className="flex items-center justify-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedId(row.id);
                                      setOpenDeleteConfirmation(true);
                                    }}
                                    size="small"
                                    aria-label="delete"
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <span>
                                  <IconButton
                                    onClick={async () => {
                                      const response: any = await dispatch(getBillerDetailData(row.id));
                                      if (typeof response === 'object' && Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        reset({
                                          id: response?.id,
                                          nama: response?.nama || '',
                                          host: response?.host || '',
                                          credential1: response?.credential_1 || '',
                                          credential2: response?.credential_2 || '',
                                          credential3: response?.credential_3 || '',
                                          active: response?.active || '',
                                        });
                                        handleClickOpen();
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Saldo Check">
                                <span>
                                  <IconButton
                                    disabled={row?.have_saldo}
                                    onClick={async () => {
                                      const response: any = await dispatch(getBillerSaldoData(row.id));
                                      if (typeof response === 'boolean' && response) {
                                        setOpenSaldoDialog(true);
                                        setSelectedBiller(row?.nama);
                                      }
                                    }}
                                    size="small"
                                    aria-label="detail"
                                    color="success"
                                  >
                                    <Payment fontSize="small" />
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
      {openFormDialog && (
        <BootstrapDialog aria-labelledby="customized-dialog-title" open={openFormDialog} maxWidth="md" fullWidth>
          <BootstrapDialogTitle id="customized-dialog-title" onClose={handleClose}>
            {editForm ? 'Edit Data Biller' : 'Data Biller Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <div className="flex flex-col items-stretch gap-4 w-full">
              <Controller
                control={control}
                name="nama"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Name</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Biller name"
                      helperText={errors?.nama && errors.nama?.message}
                      error={!!errors?.nama}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="host"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Host</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Host"
                      helperText={errors?.host && errors.host?.message}
                      error={!!errors?.host}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="credential1"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Credential 1</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Credential 1"
                      helperText={errors?.credential1 && errors.credential1?.message}
                      error={!!errors?.credential1}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="credential2"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Credential 2</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Credential 2"
                      helperText={errors?.credential2 && errors.credential2?.message}
                      error={!!errors?.credential2}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="credential3"
                render={({ field }) => (
                  <div className="flex flex-col gap-3 w-full">
                    <label className="text-sm font-semibold">Credential 3</label>
                    <TextField
                      {...field}
                      fullWidth
                      placeholder="Credential 3"
                      helperText={errors?.credential3 && errors.credential3?.message}
                      error={!!errors?.credential3}
                    />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="active"
                render={({ field: { onChange, value } }) => (
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-semibold">Active</label>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={value || false}
                          onChange={(e) => {
                            onChange(e.target.checked);
                          }}
                          name="active"
                        />
                      }
                      label={value ? 'ACTIVE' : 'DISABLE'}
                    />
                  </div>
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button disabled={loadingPost} color="inherit" onClick={handleClose}>
              Batal
            </Button>
            <Button
              disabled={loadingPost}
              variant="contained"
              onClick={() => {
                if (editForm) {
                  handleEditConfirmation();
                } else {
                  onSubmit();
                }
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
      {openDeleteConfirmation && (
        <Confirmation
          open={openDeleteConfirmation}
          title={'Hapus data biller?'}
          content={`Konfirmasi untuk menghapus data biller dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenDeleteConfirmation(false)}
          confirmActionHandler={() => handleDeleteData(selectedId || 0)}
          loading={loadingDelete || false}
          loadingText={'Menghapus'}
          confirmActionText={'Hapus'}
          cancelActionText={'Batal'}
          type="error"
        />
      )}
      {openEditConfirmation && (
        <Confirmation
          open={openEditConfirmation}
          title={'Ubah data biller?'}
          content={`Konfirmasi untuk mengubah data biller dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenEditConfirmation(false)}
          confirmActionHandler={onSubmit}
          loading={loadingPost || false}
          loadingText={'Mengubah'}
          confirmActionText={'OK'}
          cancelActionText={'Batal'}
          type="primary"
        />
      )}
      {openImagePreview && (
        <BootstrapDialog
          onClose={() => {
            setSelectedImagePreview('');
            setOpenImagePreview(false);
          }}
          aria-labelledby="customized-dialog-title"
          open={openImagePreview}
          maxWidth="sm"
          fullWidth
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={() => {
              setSelectedImagePreview('');
              setOpenImagePreview(false);
            }}
          >
            {'Image Preview'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex flex-col items-center justify-center h-[240px]">
              <img alt="preview" className="w-full h-full p-1 object-scale-down" src={selectedImagePreview} />
            </section>
          </DialogContent>
        </BootstrapDialog>
      )}
      {openSaldoDialog && (
        <BootstrapDialog
          onClose={() => setOpenSaldoDialog(false)}
          aria-labelledby="customized-dialog-title"
          open={openSaldoDialog}
          maxWidth="md"
          fullWidth
        >
          <BootstrapDialogTitle id="customized-dialog-title" onClose={() => setOpenSaldoDialog(false)}>
            Cek Saldo {selectedBiller}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <Typography variant="body1">{billerSaldo || 'Keterangan saldo tidak tersedia'}</Typography>
          </DialogContent>
        </BootstrapDialog>
      )}
    </>
  );
};

export default Biller;
