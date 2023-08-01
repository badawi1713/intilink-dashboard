/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { yupResolver } from '@hookform/resolvers/yup';
import { BrokenImage, Delete, Edit, ImageSearchOutlined } from '@mui/icons-material';
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
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewProductsData,
  changePointExchangeProductsReducer,
  deleteProductsData,
  editProductsData,
  getPointExchangeProductsData,
  getProductsCategoryListData,
} from 'src/store/actions/point-exchange-action/point-exchange-products-action';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const productsSchema = yup.object().shape({
  poin: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Poin diharuskan untuk diisi')
    .min(0, 'Poin minimum adalah 0')
    .required('Poin diharuskan untuk diisi'),
  buyPrice: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Harga beli diharuskan untuk diisi')
    .min(0, 'Harga beli minimum adalah Rp0')
    .required('Harga beli diharuskan untuk diisi'),
  jumlah_hadiah: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Jumlah hadiah diharuskan untuk diisi')
    .min(0, 'Jumlah hadiah minimum adalah 0')
    .required('Jumlah hadiah diharuskan untuk diisi'),
  image: yup.mixed().required('Gambar produk diharuskan untuk diisi'),
  name: yup.string().required('Nama diharuskan untuk diisi'),
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
  poin: number;
  harga_beli: number;
  jumlah_hadiah: number;
  id: string;
  image: any;
  keterangan: string;
  nama: string;
  banner: boolean;
  status: boolean;
  index: number;
}

function createData(
  poin: number,
  harga_beli: number,
  jumlah_hadiah: number,
  id: string,
  image: any,
  keterangan: string,
  nama: string,
  banner: boolean,
  status: boolean,
  index: number,
): Data {
  return {
    poin,
    harga_beli,
    jumlah_hadiah,
    id,
    image,
    keterangan,
    nama,
    banner,
    status,
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
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Product',
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
    id: 'poin',
    disablePadding: false,
    label: 'Poin',
    disableSort: false,
  },
  {
    id: 'harga_beli',
    disablePadding: false,
    label: 'Harga Beli',
    disableSort: false,
  },
  {
    id: 'jumlah_hadiah',
    disablePadding: false,
    label: 'Jumlah',
    disableSort: false,
  },
  {
    id: 'banner',
    disablePadding: false,
    label: 'Banner',
    align: 'center',
    disableSort: true,
  },
  {
    id: 'status',
    disablePadding: false,
    label: 'Status',
    align: 'center',
    disableSort: true,
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
  adminNominal: number;
  selectedAdminType: string;
  billerProductId: string;
  poin: number;
  buyPrice: number;
  jumlah_hadiah: number;
  id: string;
  image: any;
  notes: string;
  commission: number;
  name: string;
  banner: boolean;
  status: boolean;
};

const Products = () => {
  const dispatch = useAppDispatch();
  const { data, page, sortBy, sortType, limit, total, search, loadingPost, loadingDelete, loading, error } =
    useAppSelector((state) => state.pointExchangeProductsReducer);
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
      poin: 0,
      buyPrice: 0,
      jumlah_hadiah: 0,
      id: '',
      image: '',
      notes: '',
      name: '',
      banner: false,
      status: true,
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
      adminNominal: 0,
      selectedAdminType: '',
      poin: 0,
      buyPrice: 0,
      jumlah_hadiah: 0,
      id: '',
      image: '',
      notes: '',
      commission: 0,
      name: '',
      banner: false,
      status: true,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const form = new FormData();
    form.append('poin', `${formData.poin}`);
    form.append('harga_beli', `${formData.buyPrice}`);
    form.append('jumlah_hadiah', `${formData.jumlah_hadiah}`);
    form.append('image', typeof formData?.image === 'string' ? '' : formData?.image);
    form.append('keterangan', formData.notes);
    form.append('name', formData.name);
    form.append('banner', `${formData.banner}`);
    form.append('status', `${formData.status}`);
    form.append('id', formData.id);
    if (editForm) {
      form.append('status', '1');
    }
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
      const response = await dispatch(editProductsData(formData?.id, form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getPointExchangeProductsData());
      }
    } else {
      const response = await dispatch(addNewProductsData(form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getPointExchangeProductsData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getPointExchangeProductsData());
    dispatch(getProductsCategoryListData());
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
        dispatch(getPointExchangeProductsData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row, index) =>
    createData(
      row?.poin,
      row?.harga_beli,
      row?.jumlah_hadiah,
      row?.id,
      row?.image,
      row?.keterangan,
      row?.nama,
      row?.banner,
      row?.status,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changePointExchangeProductsReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getPointExchangeProductsData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changePointExchangeProductsReducer({
          page: newPage,
        }),
      );
      dispatch(getPointExchangeProductsData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changePointExchangeProductsReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getPointExchangeProductsData());
  };

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deleteProductsData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getPointExchangeProductsData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const productImage = useWatch({ control, name: 'image' });

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
                changePointExchangeProductsReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changePointExchangeProductsReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getPointExchangeProductsData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Produk Tukar Poin
            </Typography>
            <Typography variant="body1">Manajemen daftar produk untuk tukar poin</Typography>
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
                  changePointExchangeProductsReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getPointExchangeProductsData());
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
                          <TableCell align="left">{row.poin ?? 0}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_beli ?? 0)}</TableCell>
                          <TableCell align="left">{row.jumlah_hadiah ?? 0}</TableCell>

                          <TableCell align="center">
                            {row.banner ? (
                              <CheckCircleIcon titleAccess="Aktif" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Tidak Aktif" fontSize="small" color="error" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {row.status ? (
                              <CheckCircleIcon titleAccess="Aktif" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Tidak Aktif" fontSize="small" color="error" />
                            )}
                          </TableCell>
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
                                        poin: row?.poin || 0,
                                        buyPrice: row?.harga_beli || 0,
                                        jumlah_hadiah: row?.jumlah_hadiah || 0,
                                        id: row?.id || '',
                                        image: row?.image || '',
                                        notes: row?.keterangan || '',
                                        name: row?.nama || '',
                                        banner: !!row?.banner,
                                        status: !!row?.status,
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
            {editForm ? 'Edit Data Produk' : 'Data Produk Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Nama</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nama produk"
                        helperText={errors?.name && errors.name?.message}
                        error={!!errors?.name}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="poin"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Poin</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan poin"
                        helperText={errors?.poin && errors.poin?.message}
                        error={!!errors?.poin}
                        type="number"
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="buyPrice"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Harga Beli</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan harga jual"
                        helperText={errors?.buyPrice && errors.buyPrice?.message}
                        error={!!errors?.buyPrice}
                        type="number"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="jumlah_hadiah"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Jumlah hadiah</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan jumlah hadiah"
                        helperText={errors?.jumlah_hadiah && errors.jumlah_hadiah?.message}
                        error={!!errors?.jumlah_hadiah}
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
                        {productImage && (
                          <a
                            href={
                              typeof productImage === 'string'
                                ? `${import.meta.env.VITE_IMAGE_URL + productImage}`
                                : productImage
                                ? URL.createObjectURL(productImage)
                                : ''
                            }
                            target="_blank"
                            rel="noreferrer"
                            className=" w-14 p-2 bg-slate-100 rounded-md"
                          >
                            <img
                              src={
                                typeof productImage === 'string'
                                  ? `${import.meta.env.VITE_IMAGE_URL + productImage}`
                                  : productImage
                                  ? URL.createObjectURL(productImage)
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

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="notes"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Deskripsi</label>
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Masukkan deskripsi produk"
                        helperText={errors?.notes && errors.notes?.message}
                        error={!!errors?.notes}
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="banner"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold">Banner</label>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value || false}
                            onChange={(e) => {
                              onChange(e.target.checked);
                            }}
                            name="banner"
                          />
                        }
                        label={value ? 'ACTIVE' : 'DISABLE'}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="status"
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
                            name="status"
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
          title={'Hapus data produk?'}
          content={`Konfirmasi untuk menghapus data produk dengan id ${selectedId}.`}
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
          title={'Ubah data produk?'}
          content={`Konfirmasi untuk mengubah data produk dengan id ${selectedId}.`}
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

export default Products;
