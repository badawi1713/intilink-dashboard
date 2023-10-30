/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { yupResolver } from '@hookform/resolvers/yup';
import { BrokenImage, Delete, Edit, ImageSearchOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton, TextField, Tooltip, Typography } from '@mui/material';
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
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewBanksData,
  changeBanksReducer,
  deleteBanksData,
  editBanksData,
  getBanksCategoryListData,
  getBanksData,
} from 'src/store/actions/masters-action/banks-action';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const productsSchema = yup.object().shape({
  image: yup.mixed().required('Gambar bank diharuskan untuk diisi'),
  name: yup.string().required('Nama bank diharuskan untuk diisi'),
  code: yup.string().required('Kode bank diharuskan untuk diisi'),
  admin: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Biaya admin diharuskan untuk diisi')
    .min(0, 'Biaya admin minimum adalah 0')
    .required('Biaya admin diharuskan untuk diisi'),
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
  kode: string;
  created_date: string;
  last_updated: string;
  id: string;
  image: any;
  keterangan: string;
  nama: string;
  index: number;
  admin: number | null;
}

function createData(
  kode: string,
  created_date: string,
  last_updated: string,
  id: string,
  image: any,
  keterangan: string,
  nama: string,
  index: number,
  admin: number | null,
): Data {
  return {
    kode,
    created_date,
    last_updated,
    id,
    image,
    keterangan,
    nama,
    index,
    admin,
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
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Bank',
    disableSort: false,
  },
  {
    id: 'admin',
    disablePadding: false,
    label: 'Admin',
    disableSort: false,
  },
  {
    id: 'image',
    disablePadding: false,
    label: 'Image',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'kode',
    disablePadding: false,
    label: 'Kode',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'created_date',
    disablePadding: false,
    label: 'Dibuat',
    disableSort: false,
  },
  {
    id: 'last_updated',
    disablePadding: false,
    label: 'Diubah',
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
  admin: number;
  id: string;
  image: any;
  name: string;
  code: string;
};

const Banks = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loadingPost, loadingDelete, loading, error } =
    useAppSelector((state) => state.banksReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      image: '',
      name: '',
      admin: 0,
      code: '',
    },
    resolver: yupResolver(productsSchema),
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
      image: '',
      name: '',
      admin: 0,
      code: '',
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const form = new FormData();
    form.append('image', typeof formData?.image === 'string' ? '' : formData?.image);
    form.append('nama', formData.name);
    form.append('id', formData.id || '0');
    form.append('admin', `${formData.admin}`);
    form.append('kode', formData.code);

    if (formData?.image && formData?.image instanceof Blob) {
      if (formData?.image?.size > 1048576) {
        dispatch(
          showMessage({
            message: 'Maximum photo file is 1 MB',
            variant: 'error',
          }),
        );
        setOpenEditConfirmation(false);
        return false;
      }
      if (
        formData?.image?.type !== 'image/jpeg' &&
        formData?.image?.type !== 'image/png' &&
        formData?.image?.type !== 'image/jpg'
      ) {
        dispatch(
          showMessage({
            message: 'File format must be in jpeg, jpg, or png',
            variant: 'error',
          }),
        );
        setOpenEditConfirmation(false);
        return false;
      }
    }
    if (editForm) {
      const response = await dispatch(editBanksData(formData?.id, form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getBanksData());
      }
    } else {
      const response = await dispatch(addNewBanksData(form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getBanksData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getBanksData());
    dispatch(getBanksCategoryListData());
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
        dispatch(getBanksData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row, index) =>
    createData(
      row?.kode,
      row?.created_date,
      row?.last_updated,
      row?.id,
      row?.image,
      row?.keterangan,
      row?.nama,
      index,
      row?.admin,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeBanksReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getBanksData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeBanksReducer({
          page: newPage,
        }),
      );
      dispatch(getBanksData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeBanksReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getBanksData());
  };

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deleteBanksData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getBanksData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const bankImage = useWatch({ control, name: 'image' });

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
                changeBanksReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeBanksReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getBanksData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Bank
            </Typography>
            <Typography variant="body1">Manajemen daftar bank untuk transfer dana</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Tambah Data
            </Button>
          </div>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(
                  changeBanksReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getBanksData());
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
                          <TableCell align="left" component="th" id={labelId} scope="row">
                            {row.id || '-'}
                          </TableCell>
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{currencyFormat(row.admin ?? 0)}</TableCell>
                          <TableCell align="center">
                            <Tooltip title={row?.image ? 'Preview' : 'No Image'}>
                              <span>
                                <IconButton
                                  disabled={!row?.image}
                                  onClick={() => {
                                    setOpenImagePreview(true);
                                    setSelectedImagePreview(`${import.meta.env.VITE_IMAGE_URL + row.image}`);
                                  }}
                                  size="small"
                                  aria-label="preview"
                                  color="info"
                                >
                                  {row?.image ? (
                                    <ImageSearchOutlined fontSize="small" />
                                  ) : (
                                    <BrokenImage fontSize="small" />
                                  )}
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">{row.kode || '-'}</TableCell>

                          <TableCell align="left">{row.created_date || '-'}</TableCell>
                          <TableCell align="left">{row.last_updated || '-'}</TableCell>

                          <TableCell align="center">
                            <section className="flex items-center justify-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    disabled={loading}
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
                                    disabled={loading}
                                    onClick={() => {
                                      setSelectedId(row?.id);
                                      setEditForm(true);
                                      reset({
                                        id: row?.id || '',
                                        image: row?.image || '',
                                        admin: row?.admin ? +row?.admin : 0,
                                        name: row?.nama || '',
                                        code: row?.kode || '',
                                      });
                                      handleClickOpen();
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Edit fontSize="small" />
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
            {editForm ? 'Edit Data Bank' : 'Data Bank Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Nama Bank</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nama bank"
                        helperText={errors?.name && errors.name?.message}
                        error={!!errors?.name}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="code"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Kode Bank</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan kode bank"
                        helperText={errors?.code && errors.code?.message}
                        error={!!errors?.code}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="admin"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Biaya Admin</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan biaya admin"
                        helperText={errors?.admin && errors.admin?.message}
                        error={!!errors?.admin}
                        type="number"
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="image"
                  render={({ field: { onChange } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Pilih Gambar</label>
                      <section className="flex gap-3 items-stretch">
                        <TextField
                          onChange={(event: ChangeEvent) => {
                            const target = event.target as HTMLInputElement;
                            const file: File = (target.files as FileList)[0];
                            onChange(file);
                          }}
                          placeholder="Pilih gambar"
                          error={!!errors?.image}
                          type="file"
                          fullWidth
                          inputProps={{
                            accept: 'image/png, image/jpg, image/jpeg',
                          }}
                        />
                        {bankImage && (
                          <a
                            href={
                              typeof bankImage === 'string'
                                ? `${import.meta.env.VITE_IMAGE_URL + bankImage}`
                                : bankImage
                                ? URL.createObjectURL(bankImage)
                                : ''
                            }
                            target="_blank"
                            rel="noreferrer"
                            className=" w-14 p-2 bg-slate-100 rounded-md"
                          >
                            <img
                              src={
                                typeof bankImage === 'string'
                                  ? `${import.meta.env.VITE_IMAGE_URL + bankImage}`
                                  : bankImage
                                  ? URL.createObjectURL(bankImage)
                                  : ''
                              }
                              alt="product-preview"
                              className="object-contain w-full h-full"
                            />
                          </a>
                        )}
                      </section>
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
          title={'Hapus data bank?'}
          content={`Konfirmasi untuk menghapus data bank dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenDeleteConfirmation(false)}
          confirmActionHandler={() => handleDeleteData(selectedId || '')}
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
          title={'Ubah data bank?'}
          content={`Konfirmasi untuk mengubah data bank dengan id ${selectedId}.`}
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
    </>
  );
};

export default Banks;
