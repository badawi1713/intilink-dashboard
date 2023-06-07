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
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewSettingFeeUplineData,
  changeMasterSettingFeeUplineReducer,
  deleteSettingFeeUplineData,
  editSettingFeeUplineData,
  getMasterSettingFeeUplineData,
  getSettingFeeUplineProductListData,
  getSettingFeeUplineUserListData,
} from 'src/store/actions/masters-action/setting-fee-upline-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const settingFeeUplineSchema = yup.object().shape({
  upline1: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Upline 1 harus dalam format angka')
    .min(0, 'Minimal nominal bernilai 0'),
  upline2: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Upline 2 harus dalam format angka')
    .min(0, 'Minimal nominal bernilai 0'),
  upline3: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Upline 3 harus dalam format angka')
    .min(0, 'Minimal nominal bernilai 0'),
  selectedSettingFeeUplineUserGroup: yup.string().required('Grup user harus dipilih'),
  selectedSettingFeeUplineProductGroup: yup.string().required('Grup produk harus dipilih'),
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
  fee_upline1: number;
  fee_upline2: number;
  fee_upline3: number;
  user_group_name: string;
  produk_group_name: string;
  last_updated: string;
  updated_who_name: string;
  produk_group_id: string;
  user_group_id: string;
  id: string;
  index: number;
}

function createData(
  fee_upline1: number,
  fee_upline2: number,
  fee_upline3: number,
  user_group_name: string,
  produk_group_name: string,
  last_updated: string,
  updated_who_name: string,
  produk_group_id: string,
  user_group_id: string,
  id: string,
  index: number,
): Data {
  return {
    fee_upline1,
    fee_upline2,
    fee_upline3,
    user_group_name,
    produk_group_name,
    last_updated,
    updated_who_name,
    produk_group_id,
    user_group_id,
    id,
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
    id: 'produk_group_name',
    disablePadding: false,
    label: 'Grup Produk',
    disableSort: false,
  },
  {
    id: 'user_group_name',
    disablePadding: false,
    label: 'Grup User',
    disableSort: true,
  },
  {
    id: 'fee_upline1',
    disablePadding: false,
    label: 'Upline 1',
    disableSort: false,
  },
  {
    id: 'fee_upline2',
    disablePadding: false,
    label: 'Upline 2',
    disableSort: false,
  },
  {
    id: 'fee_upline3',
    disablePadding: false,
    label: 'Upline 3',
    disableSort: false,
  },
  {
    id: 'updated_who_name',
    disablePadding: false,
    label: 'Diubah Oleh',
    disableSort: false,
  },
  {
    id: 'last_updated',
    disablePadding: false,
    label: 'Terakhir Diperbarui',
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
  upline1: number;
  upline2: number;
  upline3: number;
  selectedSettingFeeUplineUserGroup: string;
  selectedSettingFeeUplineProductGroup: string;
  id: string;
};

const SettingFeeUpline = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    settingFeeUplineUserList,
    settingFeeUplineProductList,
    loadingPost,
    loadingDelete,
    loading,
    error,
    userGroupId,
    productGroupId,
  } = useAppSelector((state) => state.masterSettingFeeUplineReducer);
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
      upline1: 0,
      upline2: 0,
      upline3: 0,
      selectedSettingFeeUplineUserGroup: '',
      selectedSettingFeeUplineProductGroup: '',
      id: '',
    },
    resolver: yupResolver(settingFeeUplineSchema),
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
      upline1: 0,
      upline2: 0,
      upline3: 0,
      selectedSettingFeeUplineUserGroup: '',
      selectedSettingFeeUplineProductGroup: '',
      id: '',
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const payload = {
      upline_1: formData.upline1,
      upline_2: formData.upline2,
      upline_3: formData.upline3,
      group_user_id: formData.selectedSettingFeeUplineUserGroup,
      produk_group_id: formData.selectedSettingFeeUplineProductGroup,
    };

    if (editForm) {
      const response = await dispatch(editSettingFeeUplineData(formData?.id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterSettingFeeUplineData());
      }
    } else {
      const response = await dispatch(addNewSettingFeeUplineData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterSettingFeeUplineData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterSettingFeeUplineData());
    dispatch(getSettingFeeUplineUserListData());
    dispatch(getSettingFeeUplineProductListData());
  }, [dispatch]);

  const handleGetSettingFeeUplineUserGroupData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeMasterSettingFeeUplineReducer({
        userGroupId: value,
      }),
    );
    dispatch(getMasterSettingFeeUplineData());
  };

  const handleGetSettingFeeUplineByProductGroupData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeMasterSettingFeeUplineReducer({
        productGroupId: value,
      }),
    );
    dispatch(getMasterSettingFeeUplineData());
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
        dispatch(getMasterSettingFeeUplineData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row, index) =>
    createData(
      row?.fee_upline1,
      row?.fee_upline2,
      row?.fee_upline3,
      row?.user_group_name,
      row?.produk_group_name,
      row?.last_updated,
      row?.updated_who_name,
      row?.produk_group_id,
      row?.user_group_id,
      row?.id,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterSettingFeeUplineReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterSettingFeeUplineData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterSettingFeeUplineReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterSettingFeeUplineData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterSettingFeeUplineReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterSettingFeeUplineData());
  };

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deleteSettingFeeUplineData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterSettingFeeUplineData());
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
                changeMasterSettingFeeUplineReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeMasterSettingFeeUplineReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getMasterSettingFeeUplineData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Setting Fee Upline
            </Typography>
            <Typography variant="body1">Manajemen daftar setting fee upline</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Tambah Data
            </Button>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="settingFeeUpline-category-select">Grup User</InputLabel>
                <Select
                  size="small"
                  labelId="settingFeeUpline-category-select-label"
                  id="settingFeeUpline-category-select"
                  value={userGroupId}
                  label="Grup User"
                  onChange={handleGetSettingFeeUplineUserGroupData}
                >
                  <MenuItem value="Semua">
                    <em>Semua</em>
                  </MenuItem>
                  {settingFeeUplineUserList?.map((category) => (
                    <MenuItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="settingFeeUpline-group-select">Grup Produk</InputLabel>
                <Select
                  size="small"
                  labelId="settingFeeUpline-group-select-label"
                  id="settingFeeUpline-group-select"
                  value={productGroupId}
                  label="Grup Produk"
                  onChange={handleGetSettingFeeUplineByProductGroupData}
                >
                  <MenuItem value="Semua">
                    <em>Semua</em>
                  </MenuItem>
                  {settingFeeUplineProductList?.map((category) => (
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
                  changeMasterSettingFeeUplineReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getMasterSettingFeeUplineData());
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
                          <TableCell align="left">{row.produk_group_name || '-'}</TableCell>
                          <TableCell align="left">{row.user_group_name || '-'}</TableCell>
                          <TableCell align="left">{currencyFormat(row.fee_upline1 ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.fee_upline2 ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.fee_upline3 ?? 0)}</TableCell>
                          <TableCell align="left">{row.updated_who_name || '-'}</TableCell>
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
                                        upline1: row?.fee_upline1,
                                        upline2: row?.fee_upline2,
                                        upline3: row?.fee_upline3,
                                        selectedSettingFeeUplineUserGroup: row?.user_group_id,
                                        selectedSettingFeeUplineProductGroup: row?.produk_group_id,
                                        id: row?.id || '',
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
            {editForm ? 'Edit Data Setting Fee Upline' : 'Data Setting Fee Upline Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="selectedSettingFeeUplineUserGroup"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Grup User</label>
                      <FormControl error={!!errors.selectedSettingFeeUplineUserGroup} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="user-select"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          <MenuItem disabled value="">
                            <em>Pilih Grup User</em>
                          </MenuItem>
                          {settingFeeUplineUserList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.selectedSettingFeeUplineUserGroup?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="selectedSettingFeeUplineProductGroup"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Grup Produk</label>
                      <FormControl error={!!errors.selectedSettingFeeUplineProductGroup} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="product-select"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        >
                          <MenuItem disabled value="">
                            <em>Pilih Grup Produk</em>
                          </MenuItem>
                          {settingFeeUplineProductList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.selectedSettingFeeUplineProductGroup?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="upline1"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Upline 1</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nominal upline 1"
                        helperText={errors?.upline1 && errors.upline1?.message}
                        error={!!errors?.upline1}
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

                <Controller
                  control={control}
                  name="upline2"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Upline 2</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nominal upline 1"
                        helperText={errors?.upline2 && errors.upline2?.message}
                        error={!!errors?.upline2}
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

                <Controller
                  control={control}
                  name="upline3"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Upline 3</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Masukkan nominal upline 1"
                        helperText={errors?.upline3 && errors.upline3?.message}
                        error={!!errors?.upline3}
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
          title={'Hapus data?'}
          content={`Konfirmasi untuk menghapus data dengan id ${selectedId}.`}
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
          title={'Ubah data?'}
          content={`Konfirmasi untuk mengubah data dengan id ${selectedId}.`}
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

export default SettingFeeUpline;
