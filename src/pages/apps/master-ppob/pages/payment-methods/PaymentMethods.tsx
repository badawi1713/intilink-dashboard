/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
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
  addNewPaymentMethodsData,
  changeMasterPaymentMethodsReducer,
  deletePaymentMethodsData,
  editPaymentMethodsData,
  getMasterPaymentMethodsData,
  getPaymentMethodsBillerListFormData,
  getPaymentMethodsProductListData,
} from 'src/store/actions/masters-action/payment-methods-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const paymentMethodsSchema = yup.object().shape({
  notes: yup.string().min(3, 'Masukkan minimal 3 huruf').required('Diharuskan untuk mengisi keterangan'),
  selectedPaymentMethod: yup.string().required('Diharuskan untuk memilih tipe pembayaran'),
  selectedProductId: yup.string().required('Diharuskan untuk memilih produk'),
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
  keterangan: string;
  id: string;
  type: string;
  created_date: string;
  last_updated: string;
  index: number;
}

function createData(
  keterangan: string,
  id: string,
  type: string,
  created_date: string,
  last_updated: string,
  index: number,
): Data {
  return {
    keterangan,
    id,
    type,
    created_date,
    last_updated,
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
    id: 'index',
    disablePadding: true,
    label: 'ID',
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
    id: 'type',
    disablePadding: false,
    label: 'Cara Bayar',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'created_date',
    disablePadding: false,
    label: 'Tanggal Dibuat',
    disableSort: false,
    align: 'center',
  },
  {
    id: 'last_updated',
    disablePadding: false,
    label: 'Terakhir Diubah',
    disableSort: false,
    align: 'center',
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
  notes: string;
  selectedProductId: string;
  selectedPaymentMethod: string;
  id: string;
};

const PaymentMethods = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    paymentMethodProductList,
    paymentMethodTypeList,
    loadingPost,
    loadingDelete,
    loading,
    error,
    productId,
    typeId,
    loadingList,
  } = useAppSelector((state) => state.masterPaymentMethodsReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      notes: '',
      selectedPaymentMethod: '',
      selectedProductId: '',
    },
    resolver: yupResolver(paymentMethodsSchema),
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
      notes: '',
      selectedPaymentMethod: '',
      selectedProductId: '',
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const { id, notes, selectedPaymentMethod, selectedProductId } = formData;
    const payload = {
      keterangan: notes,
      type: selectedPaymentMethod,
      product_id: selectedProductId,
    };

    if (editForm) {
      const response = await dispatch(editPaymentMethodsData(id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterPaymentMethodsData());
      }
    } else {
      const response = await dispatch(addNewPaymentMethodsData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterPaymentMethodsData());
      }
    }
  });

  const handleGetData = useCallback(async () => {
    const selectedProductId = await dispatch(getPaymentMethodsProductListData());
    await dispatch(
      changeMasterPaymentMethodsReducer({
        productId: selectedProductId?.length > 0 ? selectedProductId[0].id : '',
      }),
    );

    dispatch(getMasterPaymentMethodsData());
    dispatch(getPaymentMethodsBillerListFormData());
  }, [dispatch]);

  const handleGetPaymentMethodsData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeMasterPaymentMethodsReducer({
        typeId: value,
        page: 0,
      }),
    );
    dispatch(getMasterPaymentMethodsData());
  };

  useEffect(() => {
    if (isMount.current) {
      handleGetData();
      isMount.current = false;
    }
  }, [handleGetData]);

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        dispatch(getMasterPaymentMethodsData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row, index) =>
    createData(row?.keterangan, `${row?.id}`, row?.type, row?.created_date, row?.last_updated, index),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterPaymentMethodsReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterPaymentMethodsData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterPaymentMethodsReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterPaymentMethodsData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterPaymentMethodsReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterPaymentMethodsData());
  };

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deletePaymentMethodsData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterPaymentMethodsData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const handleGetProductData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeMasterPaymentMethodsReducer({
        productId: value,
        page: 0,
      }),
    );
    dispatch(getMasterPaymentMethodsData());
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
                changeMasterPaymentMethodsReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeMasterPaymentMethodsReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getMasterPaymentMethodsData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Cara Bayar
            </Typography>
            <Typography variant="body1">Manajemen daftar cara bayar produk</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button
              color="success"
              size="small"
              variant="contained"
              onClick={() => {
                reset({
                  id: '',
                  notes: '',
                  selectedPaymentMethod: typeId,
                  selectedProductId: productId,
                });
                handleClickOpen();
              }}
            >
              Tambah Data
            </Button>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="paymentMethod-category-select">Daftar ID Produk</InputLabel>
                <Select
                  size="small"
                  labelId="paymentMethod-category-select-label"
                  id="paymentMethod-category-select"
                  value={productId}
                  label="Daftar ID Produk"
                  onChange={handleGetProductData}
                >
                  {/* <MenuItem value="Semua">
                    <em>Semua</em>
                  </MenuItem> */}
                  {paymentMethodProductList?.map((category) => (
                    <MenuItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="paymentMethod-group-select">Kategori Cara Pembayaran</InputLabel>
                <Select
                  size="small"
                  labelId="paymentMethod-group-select-label"
                  id="paymentMethod-group-select"
                  value={typeId}
                  label="Kategori Cara Pembayaran"
                  onChange={handleGetPaymentMethodsData}
                >
                  <MenuItem value="Semua">
                    <em>Semua</em>
                  </MenuItem>
                  {paymentMethodTypeList?.map((category) => (
                    <MenuItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
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
                  changeMasterPaymentMethodsReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getMasterPaymentMethodsData());
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
                            {row.id || '-'}
                          </TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          <TableCell align="center">{row.type || '-'}</TableCell>
                          <TableCell align="center">{row.created_date || '-'}</TableCell>
                          <TableCell align="center">{row.last_updated || '-'}</TableCell>

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
                                        id: row.id,
                                        notes: row.keterangan,
                                        selectedPaymentMethod: row.type,
                                        selectedProductId: productId,
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
            {editForm ? 'Edit Data Cara Pembayaran' : 'Data Cara Pembayaran Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                {editForm && (
                  <Controller
                    control={control}
                    name="id"
                    render={({ field }) => (
                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-semibold">ID</label>
                        <TextField
                          {...field}
                          disabled={editForm}
                          placeholder="ID Cara Bayar"
                          helperText={errors?.id && errors.id?.message}
                          error={!!errors?.id}
                        />
                      </div>
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name="selectedProductId"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">ID Produk</label>
                      <FormControl error={!!errors.selectedProductId} required fullWidth>
                        <Select input={<OutlinedInput />} fullWidth id="paymentMethodProduct-group-select" {...field}>
                          <MenuItem disabled value="">
                            <em>{'Pilih ID Produk'}</em>
                          </MenuItem>
                          {paymentMethodProductList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {loadingList
                            ? 'Loading'
                            : paymentMethodProductList?.length === 0
                            ? 'Pilihan produk tidak tersedia'
                            : !errors?.selectedProductId?.message && paymentMethodProductList?.length === 0
                            ? 'Diharuskan memilih produk terlebih dahulu'
                            : errors?.selectedProductId?.message}
                        </FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="selectedPaymentMethod"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Metode Bayar</label>
                      <FormControl error={!!errors.selectedPaymentMethod} required fullWidth>
                        <Select input={<OutlinedInput />} fullWidth id="paymentMethod-group-select" {...field}>
                          <MenuItem disabled value="">
                            <em>{'Pilih Metode Bayar'}</em>
                          </MenuItem>
                          {paymentMethodTypeList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>
                          {loadingList
                            ? 'Loading'
                            : paymentMethodTypeList?.length === 0
                            ? 'Pilihan metode bayar tidak tersedia'
                            : !errors?.selectedPaymentMethod?.message && paymentMethodTypeList?.length === 0
                            ? 'Diharuskan memilih metode bayar terlebih dahulu'
                            : errors?.selectedPaymentMethod?.message}
                        </FormHelperText>
                      </FormControl>
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
                      <label className="text-sm font-semibold">Notes</label>
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Masukkan keterangan"
                        helperText={errors?.notes && errors.notes?.message}
                        error={!!errors?.notes}
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
          title={'Hapus data cara bayar?'}
          content={`Konfirmasi untuk menghapus data cara bayar dengan id ${selectedId}.`}
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
          title={'Ubah data cara bayar?'}
          content={`Konfirmasi untuk mengubah data cara bayar dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenEditConfirmation(false)}
          confirmActionHandler={onSubmit}
          loading={loadingPost || false}
          loadingText={'Mengubah'}
          confirmActionText={'OK'}
          cancelActionText={'Batal'}
          type="primary"
        />
      )}
    </>
  );
};

export default PaymentMethods;
