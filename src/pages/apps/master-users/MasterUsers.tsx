import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit, Person2 } from '@mui/icons-material';
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
  addNewUsersData,
  changeMasterUsersReducer,
  deleteUsersData,
  editUsersData,
  getMasterUsersData,
  getUserMemberDetailData,
  getUsersDetailData,
} from 'src/store/actions/masters-action/users-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';
import UserMemberDetail from './components/UserMemberDetail';

// const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

const productCategorySchema = yup.object().shape({
  nama: yup.string().required('Nama harus diisi'),
  no_telp: yup.string().required('Nomor telepon harus diisi'),
  email: yup.string().required('Email harus diisi'),
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
  saldo: string;
  status: boolean;
  tanggal_daftar: string;
  zonapay_id: null | string;
  poin: string;
  group_name: string;
  index: number;
}

function createData(
  id: number,
  nama: string,
  saldo: string,
  status: boolean,
  tanggal_daftar: string,
  zonapay_id: null | string,
  poin: string,
  group_name: string,
  index: number,
): Data {
  return {
    id,
    nama,
    saldo,
    status,
    tanggal_daftar,
    zonapay_id,
    poin,
    group_name,
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
    id: 'zonapay_id',
    disablePadding: true,
    label: 'Zonapay ID',
    disableSort: false,
    align: 'left',
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Nama',
    disableSort: false,
  },
  {
    id: 'saldo',
    disablePadding: false,
    label: 'Saldo',
    disableSort: true,
  },
  {
    id: 'poin',
    disablePadding: false,
    label: 'Poin',
    disableSort: true,
  },
  {
    id: 'group_name',
    disablePadding: false,
    label: 'Grup',
    disableSort: true,
  },
  {
    id: 'tanggal_daftar',
    disablePadding: false,
    label: 'Tanggal Daftar',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'status',
    disablePadding: false,
    label: 'Available',
    align: 'center',
    disableSort: true,
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
  active: boolean;
  no_telp: string;
  email: string;
};

const MasterUsers = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loadingPost, loadingDelete, loading, error } =
    useAppSelector((state) => state.masterUsersReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openUserMemberDetail, setOpenUserMemberDetail] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      nama: '',
      email: '',
      active: true,
      no_telp: '',
    },
    resolver: yupResolver(productCategorySchema),
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
      email: '',
      active: true,
      no_telp: '',
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      id: formData.id,
      nama: formData.nama,
      active: formData.active,
      email: formData.email,
      no_telp: formData.no_telp,
    };

    if (editForm) {
      const response = await dispatch(editUsersData(formData?.id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterUsersData());
      }
    } else {
      const response = await dispatch(addNewUsersData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterUsersData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterUsersData());
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
        dispatch(getMasterUsersData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data, index) =>
    createData(
      row?.id,
      row?.nama,
      row?.saldo,
      row?.status,
      row?.tanggal_daftar,
      row?.zonapay_id,
      row?.poin,
      row?.group_name,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterUsersReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterUsersData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterUsersReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterUsersData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterUsersReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterUsersData());
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteUsersData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterUsersData());
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
            onChange={(e: React.FormEvent<HTMLInputElement>) => {
              dispatch(
                changeMasterUsersReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeMasterUsersReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getMasterUsersData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master User
            </Typography>
            <Typography variant="body1">Manajemen daftar user</Typography>
          </div>
          <Button color="success" size="small" variant="contained" disabled onClick={handleClickOpen}>
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
                  changeMasterUsersReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getMasterUsersData());
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
                    orderBy={sortBy || 'status'}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {rows?.map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow hover tabIndex={-1} key={row.id}>
                          <TableCell align="left" component="th" id={labelId} scope="row">
                            {row.zonapay_id || '-'}
                          </TableCell>
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.saldo || 0}</TableCell>
                          <TableCell align="left">{row.poin || 0}</TableCell>
                          <TableCell align="left">{row.group_name || '-'}</TableCell>
                          <TableCell align="center">{row.tanggal_daftar || '-'}</TableCell>
                          <TableCell align="center">
                            {!row.status ? (
                              <CheckCircleIcon titleAccess="Tersedia" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Dihapus" fontSize="small" color="error" />
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
                                      const response: any = await dispatch(getUsersDetailData(row.id));
                                      if (typeof response === 'object' && Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        reset({
                                          id: response?.id,
                                          nama: response?.nama || '',
                                          email: response?.email || '',
                                          active: response?.active,
                                          no_telp: response?.no_telp || '',
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
                              <Tooltip title="Member">
                                <span>
                                  <IconButton
                                    onClick={async () => {
                                      const response: any = await dispatch(
                                        getUserMemberDetailData(row.zonapay_id || ''),
                                      );
                                      if (response) {
                                        setOpenUserMemberDetail(true);
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Person2 fontSize="small" />
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
            {editForm ? 'Edit Data User' : 'Data User Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="id"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">ID</label>
                      <TextField
                        {...field}
                        disabled={editForm}
                        fullWidth
                        placeholder="ID"
                        helperText={errors?.id && errors.id?.message}
                        error={!!errors?.id}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="nama"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Nama Lengkap</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nama lengkap"
                        helperText={errors?.nama && errors.nama?.message}
                        error={!!errors?.nama}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="no_telp"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">No. Telepon</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nomor telepon"
                        helperText={errors?.nama && errors.nama?.message}
                        error={!!errors?.nama}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Email</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan alamat email"
                        helperText={errors?.email && errors.email?.message}
                        error={!!errors?.email}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="active"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold">Status</label>
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
            </section>
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
          title={'Hapus data user?'}
          content={`Konfirmasi untuk menghapus data user dengan id ${selectedId}.`}
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
          title={'Ubah data user?'}
          content={`Konfirmasi untuk mengubah data user dengan id ${selectedId}.`}
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
      {openUserMemberDetail && (
        <UserMemberDetail open={openUserMemberDetail} handleClose={() => setOpenUserMemberDetail(false)} />
      )}
    </>
  );
};

export default MasterUsers;
