import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  Autocomplete,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
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
  addNewProductGroupData,
  changeMasterProductGroupReducer,
  deleteProductGroupData,
  editProductGroupData,
  getMasterProductGroupData,
  getProductGroupDetailData,
  getProductCategoryListData,
} from 'src/store/actions/masters-action/product-group-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const productGroupSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  id: yup.string().required('ID is required'),
  notes: yup.string().required('Notes is required'),
  product_category_id: yup.object().nullable().required('Category is required'),
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
  icon: string;
  product_category_name: string;
  deleted: boolean;
  product_category_id: number;
  keterangan: string;
  index: number;
}

function createData(
  id: number,
  nama: string,
  icon: string,
  product_category_name: string,
  deleted: boolean,
  product_category_id: number,
  keterangan: string,
  index: number,
): Data {
  return {
    id,
    nama,
    icon,
    product_category_name,
    deleted,
    product_category_id,
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
    id: 'id',
    disablePadding: true,
    label: 'ID',
    disableSort: false,
  },
  {
    id: 'nama',
    disablePadding: false,
    label: 'Nama',
    disableSort: false,
  },
  {
    id: 'product_category_name',
    disablePadding: false,
    label: 'Category',
    disableSort: false,
  },
  {
    id: 'keterangan',
    disablePadding: false,
    label: 'Keterangan',
    disableSort: false,
  },
  {
    id: 'deleted',
    disablePadding: false,
    label: 'Tersedia',
    align: 'center',
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

type FormType = {
  id: string;
  name: string;
  product_category_id: null | { id: number; name: string };
  notes: string;
};

const ProductGroup = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    productCategoryList,
    loadingPost,
    loadingDelete,
    loading,
    error,
    categoryId,
  } = useAppSelector((state) => state.masterProductGroupReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: '',
      name: '',
      notes: '',
      product_category_id: null,
    },
    resolver: yupResolver(productGroupSchema),
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
      name: '',
      notes: '',
      product_category_id: null,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      product_category_id: formData.product_category_id?.id ?? 0,
      nama: formData.name,
      keterangan: formData.notes,
      id: formData.id,
    };
    if (editForm) {
      const response = await dispatch(editProductGroupData(formData?.id, payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterProductGroupData());
      }
    } else {
      const response = await dispatch(addNewProductGroupData(payload));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterProductGroupData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterProductGroupData());
    dispatch(getProductCategoryListData());
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
        dispatch(getMasterProductGroupData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data, index) =>
    createData(
      row?.id,
      row?.nama,
      row?.icon,
      row?.product_category_name,
      row?.deleted,
      row?.product_category_id,
      row?.keterangan,
      index,
    ),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterProductGroupReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterProductGroupData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterProductGroupReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterProductGroupData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterProductGroupReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterProductGroupData());
  };

  const getProductGroupListItem = (option: { id: number; name: string }) => {
    if (!option?.id) option = productCategoryList?.find((op) => op.id === option);
    return option;
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteProductGroupData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterProductGroupData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const handleGetProductGroupData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    dispatch(
      changeMasterProductGroupReducer({
        categoryId: value,
      }),
    );
    dispatch(getMasterProductGroupData());
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
                changeMasterProductGroupReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              );
              if ((e.target as HTMLInputElement).value === '') {
                dispatch(
                  changeMasterProductGroupReducer({
                    search: '',
                    page: 0,
                  }),
                );
                dispatch(getMasterProductGroupData());
              }
            }}
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Grup Produk
            </Typography>
            <Typography variant="body1">Manajemen daftar grup produk</Typography>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Tambah Data
            </Button>
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="product-category-select">Kategori Produk</InputLabel>
                <Select
                  size="small"
                  labelId="product-category-select-label"
                  id="product-category-select"
                  value={categoryId}
                  label="Kategori Produk"
                  onChange={handleGetProductGroupData}
                >
                  <MenuItem value="Semua">
                    <em>Semua</em>
                  </MenuItem>
                  {productCategoryList?.map((category) => (
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
                  changeMasterProductGroupReducer({
                    page: 0,
                    sortBy: 'id',
                  }),
                );
                dispatch(getMasterProductGroupData());
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
                          <TableCell align="left" component="th" id={labelId} scope="row">
                            {row.id}
                          </TableCell>
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.product_category_name || '-'}</TableCell>
                          <TableCell align="left">{row.keterangan || '-'}</TableCell>
                          <TableCell align="center">
                            {!row.deleted ? (
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
                                      const response: any = await dispatch(getProductGroupDetailData(row.id));
                                      if (typeof response === 'object' && Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        const selectedParentProductGroup =
                                          productCategoryList?.find(
                                            (productGroup) => productGroup?.id === response?.product_category_id,
                                          ) || null;
                                        reset({
                                          id: response?.id,
                                          name: response?.nama,
                                          product_category_id: selectedParentProductGroup,
                                          notes: response?.keterangan,
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
            {editForm ? 'Edit Data Grup Produk' : 'Data Grup Produk Baru'}
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
                        placeholder="Type product group id"
                        helperText={errors?.id && errors.id?.message}
                        error={!!errors?.id}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Name</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type product group name"
                        helperText={errors?.name && errors.name?.message}
                        error={!!errors?.name}
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
                        fullWidth
                        placeholder="Type product group notes"
                        helperText={errors?.notes && errors.notes?.message}
                        error={!!errors?.notes}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="product_category_id"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Kategori Produk</label>
                      <Autocomplete
                        onChange={(event, item) => {
                          onChange(item);
                        }}
                        id="product_category_id"
                        value={value}
                        isOptionEqualToValue={(option, val) => {
                          return option?.id === getProductGroupListItem(val)?.id;
                        }}
                        fullWidth
                        options={productCategoryList || []}
                        getOptionLabel={(item) => (item.name ? item.name : '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            error={!!errors.product_category_id}
                            helperText={errors?.product_category_id?.message}
                            variant="outlined"
                            placeholder="Choose product category"
                            fullWidth
                          />
                        )}
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
          title={'Hapus data grup produk?'}
          content={`Konfirmasi untuk menghapus data grup produk dengan id ${selectedId}.`}
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
          title={'Ubah data grup produk?'}
          content={`Konfirmasi untuk mengubah data grup produk dengan id ${selectedId}.`}
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

export default ProductGroup;
