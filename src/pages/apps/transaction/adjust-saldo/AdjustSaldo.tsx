import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  TextField,
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
  addNewAdjustSaldoData,
  changeTransactionAdjustSaldoReducer,
  deleteAdjustSaldoData,
  editAdjustSaldoData,
  getTransactionAdjustSaldoData,
  getUserListData,
} from 'src/store/actions/transactions-action/adjust-saldo-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const typeList = [
  {
    id: '1',
    name: 'Tambah Saldo User',
  },
  {
    id: '2',
    name: 'Kurangi Saldo User',
  },
];

const adjustSaldoSchema = yup.object().shape({
  nominal: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Nominal harus dalam format angka')
    .min(0, 'Minimal nominal bernilai 0'),
  type: yup.string().required('Jenis form penyesuaian saldo harus dipilih'),
  user_id: yup.object().nullable().required('Pengguna harus dipilih'),
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
  type_name: string;
  zonapay_id: string;
  created_who: string;
  created_date: string;
  user_id: number;
  keterangan: string;
  index: number;
}

function createData(
  id: number,
  type_name: string,
  zonapay_id: string,
  created_who: string,
  created_date: string,
  user_id: number,
  keterangan: string,
  index: number,
): Data {
  return {
    id,
    type_name,
    zonapay_id,
    created_who,
    created_date,
    user_id,
    keterangan,
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
    disableSort: true,
    align: 'center',
  },
  {
    id: 'type_name',
    disablePadding: false,
    label: 'Tipe',
    disableSort: true,
  },
  {
    id: 'created_date',
    disablePadding: false,
    label: 'Dibuat Tanggal',
    align: 'center',
    disableSort: true,
  },
  {
    id: 'created_who',
    disablePadding: false,
    label: 'Dibuat Oleh',
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
  type: string;
  nominal: number;
  user_id: null | { id: string; name: string; zonapay_id: string };
  notes: string;
};

const AdjustSaldo = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    userList,
    loadingPost,
    loadingDelete,
    loading,
    error,
    categoryId,
    loadingUserSearch,
  } = useAppSelector((state) => state.transactionAdjustSaldoReducer);
  const isMount = useRef<boolean>(true);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [userKeyword, setUserKeyword] = useState<string>('');

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);
  const debounceSearchUser: string = useDebounce<string>(userKeyword || '', 500);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      type: '1',
      nominal: 0,
      notes: '',
      user_id: null,
    },
    resolver: yupResolver(adjustSaldoSchema),
  });

  const { control, formState, handleSubmit, reset, clearErrors } = formMethods;
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
      type: '1',
      nominal: 0,
      notes: '',
      user_id: null,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      user_id: formData.user_id?.zonapay_id,
      nominal: formData.nominal,
      keterangan: formData.notes,
      type: +formData.type,
    };
    if (editForm) {
      const response = await dispatch(editAdjustSaldoData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getTransactionAdjustSaldoData());
      }
    } else {
      const response = await dispatch(addNewAdjustSaldoData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getTransactionAdjustSaldoData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getTransactionAdjustSaldoData());
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
        dispatch(getTransactionAdjustSaldoData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  useEffect(
    () => {
      if (debounceSearchUser) {
        dispatch(getUserListData(debounceSearchUser));
      } else {
        dispatch(
          changeTransactionAdjustSaldoReducer({
            loadingUserSearch: false,
            userList: [],
          }),
        );
      }
    },
    [debounceSearchUser], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data, index) =>
    createData(
      row?.id,
      row?.type_name,
      row?.zonapay_id,
      row?.created_who,
      row?.created_date,
      row?.user_id,
      row?.keterangan,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeTransactionAdjustSaldoReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getTransactionAdjustSaldoData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeTransactionAdjustSaldoReducer({
          page: newPage,
        }),
      );
      dispatch(getTransactionAdjustSaldoData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeTransactionAdjustSaldoReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getTransactionAdjustSaldoData());
  };

  const getAdjustSaldoUserListItem = (option: { id: string; nama: string }) => {
    if (!option?.id) option = userList?.find((op) => op.id === option);
    return option;
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteAdjustSaldoData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getTransactionAdjustSaldoData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const handleGetAdjustSaldoData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeTransactionAdjustSaldoReducer({
        categoryId: value,
      }),
    );
    dispatch(getTransactionAdjustSaldoData());
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
                changeTransactionAdjustSaldoReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeTransactionAdjustSaldoReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getTransactionAdjustSaldoData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Transaction Adjust Saldo
            </Typography>
            <Typography variant="body1">Manajemen daftar adjust saldo</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Form Adjust Saldo
            </Button>
            {false && (
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <FormControl sx={{ minWidth: 220 }} size="small">
                  <InputLabel id="product-category-select">Kategori Produk</InputLabel>
                  <Select
                    size="small"
                    labelId="product-category-select-label"
                    id="product-category-select"
                    value={categoryId}
                    label="Kategori Produk"
                    onChange={handleGetAdjustSaldoData}
                  >
                    <MenuItem value="Semua">
                      <em>Semua</em>
                    </MenuItem>
                    {userList?.map((category) => (
                      <MenuItem key={category?.id} value={category?.id}>
                        {category?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            )}
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
                  changeTransactionAdjustSaldoReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getTransactionAdjustSaldoData());
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
                            {row.zonapay_id}
                          </TableCell>
                          <TableCell align="left">{row.type_name || '-'}</TableCell>
                          <TableCell align="center">{row.created_date || '-'}</TableCell>
                          <TableCell align="center">{row.created_who || '-'}</TableCell>
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
            Form Adjust Saldo
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="user_id"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Pilih User</label>
                      <Autocomplete
                        onChange={(event, item) => {
                          onChange(item);
                        }}
                        id="user_id"
                        value={value}
                        isOptionEqualToValue={(option, val) => {
                          return option?.id === getAdjustSaldoUserListItem(val)?.id;
                        }}
                        fullWidth
                        loading={loadingUserSearch}
                        options={userList || []}
                        loadingText="Memuat data..."
                        noOptionsText="Data tidak tersedia"
                        getOptionLabel={(item) => (item.nama ? `${item.nama}` : '')}
                        onInputChange={(e, newValue, reason) => {
                          if (reason === 'input') {
                            clearErrors('user_id');
                            if (newValue?.length >= 3) {
                              dispatch(
                                changeTransactionAdjustSaldoReducer({
                                  loadingUserSearch: true,
                                }),
                              );
                              setUserKeyword(newValue);
                            }
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={!!errors.user_id}
                            helperText={
                              errors?.user_id?.message ||
                              'Silahkan ketik minimal 3 huruf untuk melakukan pencarian user'
                            }
                            variant="outlined"
                            placeholder="Cari user"
                            fullWidth
                          />
                        )}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Jenis Transaksi</label>
                      <FormControl error={!!errors.type} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="type-select"
                          placeholder="Pilih jenis transaksi"
                          {...field}
                          value={field.value}
                        >
                          <MenuItem disabled value="">
                            <em>Pilih jenis transaksi</em>
                          </MenuItem>
                          {typeList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.type?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="nominal"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Nominal</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nominal"
                        helperText={errors?.nominal && errors.nominal?.message}
                        error={!!errors?.nominal}
                        onChange={(e) => {
                          const { value } = e.target;
                          if (value === '' || Number(value) >= 0) {
                            field.onChange(e);
                          }
                        }}
                      />
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
                      <label className="text-sm font-semibold">Keterangan</label>
                      <TextField
                        {...field}
                        rows={4}
                        multiline
                        fullWidth
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
          title={'Hapus data adjust saldo?'}
          content={`Konfirmasi untuk menghapus data adjust saldo dengan id ${selectedId}.`}
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
          title={'Ubah data adjust saldo?'}
          content={`Konfirmasi untuk mengubah data adjust saldo dengan id ${selectedId}.`}
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

export default AdjustSaldo;
