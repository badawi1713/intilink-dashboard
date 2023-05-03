/* eslint-disable @typescript-eslint/no-misused-promises */
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
import { currencyFormat } from 'src/helpers/utils/helpers';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewProductsData,
  changeMasterProductsReducer,
  deleteProductsData,
  editProductsData,
  getMasterProductsData,
  getProductsDetailData,
  getProductsCategoryListData,
  getProductsGroupListData,
} from 'src/store/actions/masters-action/products-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const productsSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
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
  harga_beli: number;
  harga_jual: number;
  status: boolean;
  biller_name: string;
}

function createData(
  id: number,
  nama: string,
  harga_beli: number,
  harga_jual: number,
  status: boolean,
  biller_name: string,
): Data {
  return {
    id,
    nama,
    harga_beli,
    harga_jual,
    status,
    biller_name,
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
    id: 'nama',
    disablePadding: false,
    label: 'Produk',
    disableSort: false,
  },
  {
    id: 'biller_name',
    disablePadding: false,
    label: 'Biller',
    disableSort: false,
  },
  {
    id: 'harga_beli',
    disablePadding: false,
    label: 'Harga Beli',
    disableSort: false,
  },
  {
    id: 'harga_jual',
    disablePadding: false,
    label: 'Harga Jual',
    disableSort: false,
  },
  {
    id: 'status',
    disablePadding: false,
    label: 'Available',
    align: 'center',
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
  id: number;
  name: string;
  product_category_id: null | { id: number; name: string };
  icon: string;
  product_category_name: string;
};

const Products = () => {
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
    productGroupList,
    loadingPost,
    loadingDelete,
    loading,
    error,
  } = useAppSelector((state) => state.masterProductsReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<string>('All');
  const [groupId, setGroupId] = useState<string>('');

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: 0,
      name: '',
      product_category_id: null,
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
      id: 0,
      name: '',
      product_category_id: null,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      name: formData.name,
      product_category_id: formData.product_category_id?.id || 0,
    };
    let response: boolean;
    if (editForm) {
      response = await dispatch(editProductsData(formData?.id, payload));
      if (response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterProductsData());
      }
    } else {
      response = await dispatch(addNewProductsData(payload));
      if (response) {
        handleClose();
        dispatch(getMasterProductsData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterProductsData());
    dispatch(getProductsCategoryListData());
  }, [dispatch]);

  const handleGetProductGroupData = async (event: SelectChangeEvent) => {
    const value = event.target.value;
    setCategoryId(value);
    dispatch(
      changeMasterProductsReducer({
        groupId: '',
      }),
    );
    const responseData = await dispatch(getProductsGroupListData(value === 'All' ? '' : value));
    if (responseData?.length > 0 && typeof responseData === 'object') {
      dispatch(
        changeMasterProductsReducer({
          productGroupList: responseData,
          groupId: responseData[0].id,
        }),
      );
      setGroupId(responseData[0].id || '');
    }
    dispatch(getMasterProductsData());
  };

  const handleGetProductsByGroupData = (event: SelectChangeEvent) => {
    const value = event.target.value;
    setGroupId(value);
    dispatch(
      changeMasterProductsReducer({
        groupId: value === 'All' ? '' : value,
      }),
    );
    dispatch(getMasterProductsData());
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
        dispatch(getMasterProductsData());
      }
    },
    [debouncedSearchTerm], // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data) =>
    createData(row?.id, row?.nama, row?.harga_beli, row?.harga_jual, row?.status, row?.biller_name),
  );

  const handleRequestSort = useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterProductsReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        }),
      );
      dispatch(getMasterProductsData());
    },

    [sortType, sortBy, dispatch],
  );

  const handleChangePage = useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterProductsReducer({
          page: newPage,
        }),
      );
      dispatch(getMasterProductsData());
    },
    [dispatch, page],
  );

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(
      changeMasterProductsReducer({
        page: 0,
        limit: +event.target.value,
      }),
    );
    dispatch(getMasterProductsData());
  };

  const getProductsListItem = (option: { id: number; name: string }) => {
    if (!option?.id) option = productCategoryList?.find((op) => op.id === option);
    return option;
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteProductsData(id));
    if (response) {
      dispatch(getMasterProductsData());
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
                changeMasterProductsReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                }),
              )
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 lg:items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Produk
            </Typography>
            <Typography variant="body1">Manajemen daftar produk</Typography>
          </div>
          <div className="flex items-center gap-3 justify-between">
            <Button disabled color="success" size="small" variant="contained" onClick={handleClickOpen}>
              Tambah Data
            </Button>
            <div className="flex items-center gap-3">
              <FormControl sx={{ minWidth: 220 }} size="small">
                <InputLabel id="product-category-select">Product Category</InputLabel>
                <Select
                  size="small"
                  labelId="product-category-select-label"
                  id="product-category-select"
                  value={categoryId}
                  label="Product Category"
                  onChange={handleGetProductGroupData}
                >
                  <MenuItem value="All">
                    <em>All</em>
                  </MenuItem>
                  {productCategoryList?.map((category) => (
                    <MenuItem key={category?.id} value={category?.id}>
                      {category?.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {productGroupList && productGroupList?.length > 0 && (
                <FormControl sx={{ minWidth: 220 }} size="small">
                  <InputLabel id="product-group-select">Product Group</InputLabel>
                  <Select
                    size="small"
                    labelId="product-group-select-label"
                    id="product-group-select"
                    value={groupId}
                    label="Product Category"
                    onChange={handleGetProductsByGroupData}
                  >
                    <MenuItem value="All">
                      <em>All</em>
                    </MenuItem>
                    {productGroupList?.map((category) => (
                      <MenuItem key={category?.id} value={category?.id}>
                        {category?.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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
                  changeMasterProductsReducer({
                    page: 0,
                    sortBy: 'deleted',
                  }),
                );
                dispatch(getMasterProductsData());
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
                          <TableCell align="left">{row.nama || '-'}</TableCell>
                          <TableCell align="left">{row.biller_name || '-'}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_beli ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_jual ?? 0)}</TableCell>
                          <TableCell align="center">
                            {row.status ? (
                              <CheckCircleIcon titleAccess="Tersedia" fontSize="small" color="success" />
                            ) : (
                              <CancelIcon titleAccess="Dihapus" fontSize="small" color="error" />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    disabled
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
                                    disabled
                                    onClick={async () => {
                                      const response = await dispatch(getProductsDetailData(row.id));
                                      if (Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        const selectedParentProducts =
                                          productCategoryList?.find(
                                            (products) => products?.id === response?.product_category_id,
                                          ) || null;
                                        reset({
                                          id: response?.id,
                                          name: response?.name,
                                          product_category_id: selectedParentProducts,
                                          icon: response?.icon,
                                          product_category_name: response?.product_category_name,
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
                <Controller
                  control={control}
                  name="product_category_id"
                  render={({ field: { onChange, value } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Product Category</label>
                      <Autocomplete
                        onChange={(event, item) => {
                          onChange(item);
                        }}
                        id="product_category_id"
                        value={value}
                        isOptionEqualToValue={(option, val) => {
                          return option?.id === getProductsListItem(val)?.id;
                        }}
                        fullWidth
                        options={productCategoryList || []}
                        getOptionLabel={(item) => (item?.name ? item.name : '')}
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
          title={'Hapus data produk?'}
          content={`Konfirmasi untuk menghapus data produk dengan id ${selectedId}.`}
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
    </>
  );
};

export default Products;
