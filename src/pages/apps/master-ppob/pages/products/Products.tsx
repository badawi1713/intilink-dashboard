/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit, ImageSearchOutlined, BrokenImage } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Switch,
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
import axios from 'axios';
import React, { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
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
  getProductsBillerListFormData,
  getProductsCategoryListData,
  getProductsGroupListData,
} from 'src/store/actions/masters-action/products-action';
import { showMessage } from 'src/store/slices/toast-message-slice';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

const formTypeList = [
  { id: 1, name: 'Fix' },
  { id: 2, name: 'Persentase' },
];

const productsSchema = yup.object().shape({
  adminNominal: yup.number().required('Admin nominal is required'),
  selectedAdminType: yup.string().required('Admin type is required'),
  selectedBillerProduct: yup.string().required('Biller product type is required'),
  selectedBiller: yup.string().required('Biller is required'),
  selectedProductGroup: yup.string().required('Product group is required'),
  denom: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Denom is required')
    .min(0, 'Denom minimum is Rp0')
    .required('Denom is required'),
  buyPrice: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Buy price is required')
    .min(0, 'Buy price minimum is Rp0')
    .required('Buy price is required'),
  sellPrice: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Sell price is required')
    .min(0, 'Sell price minimum is Rp0')
    .required('Sell price is required'),
  upPrice: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .typeError('Up price is required')
    .min(0, 'Up price minimum is Rp0')
    .required('Up price is required'),
  id: yup.string().required('Product ID is required'),
  image: yup.mixed().required("Product's image is required"),
  commission: yup.number().required('Commission is required'),
  name: yup.string().required('Name is required'),
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
  admin_nominal: number;
  admin_type_id: number;
  admin_type_name: string;
  biller_id: number;
  biller_name: string;
  denom: number;
  harga_beli: number;
  harga_jual: number;
  harga_up: number;
  id: string;
  image: any;
  keterangan: string;
  komisi: number;
  nama: string;
  status: boolean;
  product_biller_id: number;
  index: number;
}

function createData(
  admin_nominal: number,
  admin_type_id: number,
  admin_type_name: string,
  biller_id: number,
  biller_name: string,
  denom: number,
  harga_beli: number,
  harga_jual: number,
  harga_up: number,
  id: string,
  image: any,
  keterangan: string,
  komisi: number,
  nama: string,
  status: boolean,
  product_biller_id: number,
  index: number,
): Data {
  return {
    admin_nominal,
    admin_type_id,
    admin_type_name,
    biller_id,
    biller_name,
    denom,
    harga_beli,
    harga_jual,
    harga_up,
    id,
    image,
    keterangan,
    komisi,
    nama,
    status,
    product_biller_id,
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
    id: 'biller_name',
    disablePadding: false,
    label: 'Biller',
    disableSort: false,
  },
  {
    id: 'denom',
    disablePadding: false,
    label: 'Denom',
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
    id: 'harga_up',
    disablePadding: false,
    label: 'Harga Up',
    disableSort: false,
  },
  {
    id: 'komisi',
    disablePadding: false,
    label: 'Komisi',
    disableSort: false,
  },
  {
    id: 'admin_nominal',
    disablePadding: false,
    label: 'Admin Nominal',
    disableSort: false,
  },
  {
    id: 'admin_type_name',
    disablePadding: false,
    label: 'Admin Type',
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
  adminNominal: number;
  selectedAdminType: string;
  selectedBillerProduct: string;
  selectedBiller: string;
  selectedProductGroup: string;
  selectedProductCategory: string;
  denom: number;
  buyPrice: number;
  sellPrice: number;
  upPrice: number;
  id: string;
  image: any;
  notes: string;
  commission: number;
  name: string;
  status: boolean;
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
    billerList,
    loadingPost,
    loadingDelete,
    loading,
    error,
  } = useAppSelector((state) => state.masterProductsReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] = useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>('All');
  const [groupId, setGroupId] = useState<string>('');
  const [productGroupNewFormList, setProductGroupNewFormList] = useState<any[]>([]);
  const [loadingGroupProductList, setLoadingGroupProductList] = useState<boolean>(false);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      adminNominal: 0,
      selectedAdminType: '',
      selectedBillerProduct: '',
      selectedBiller: '',
      selectedProductGroup: '',
      selectedProductCategory: '',
      denom: 0,
      buyPrice: 0,
      sellPrice: 0,
      upPrice: 0,
      id: '',
      image: '',
      notes: '',
      commission: 0,
      name: '',
      status: true,
    },
    resolver: yupResolver(productsSchema),
  });

  const { control, formState, handleSubmit, reset, setValue } = formMethods;
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
      selectedBillerProduct: '',
      selectedBiller: '',
      selectedProductGroup: '',
      selectedProductCategory: '',
      denom: 0,
      buyPrice: 0,
      sellPrice: 0,
      upPrice: 0,
      id: '',
      image: '',
      notes: '',
      commission: 0,
      name: '',
      status: true,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (formData: FormType) => {
    const form = new FormData();
    form.append('admin_nominal', `${formData.adminNominal}`);
    form.append('admin_type', formData.selectedAdminType || '');
    form.append('biller_id', `${formData.selectedBiller || ''}`);
    form.append('denom', `${formData.denom}`);
    form.append('harga_beli', `${formData.buyPrice}`);
    form.append('harga_up', `${formData.upPrice}`);
    form.append('image', typeof formData?.image === 'string' ? '' : formData?.image);
    form.append('keterangan', formData.notes);
    form.append('komisi', `${formData.commission}`);
    form.append('name', formData.name);
    form.append('status', `${formData.status}`);
    form.append('product_group_id', `${formData.selectedProductGroup || ''}`);
    form.append('product_biller_id', formData.selectedBillerProduct);
    form.append('id', formData.id);
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
        dispatch(getMasterProductsData());
      }
    } else {
      const response = await dispatch(addNewProductsData(form));
      if (typeof response === 'boolean' && response) {
        handleClose();
        dispatch(getMasterProductsData());
      }
    }
  });

  const handleGetData = useCallback(() => {
    dispatch(getMasterProductsData());
    dispatch(getProductsCategoryListData());
    dispatch(getProductsBillerListFormData());
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

  useEffect(() => {
    return () => {
      dispatch(
        changeMasterProductsReducer({
          productGroupList: [],
          groupId: '',
        }),
      );
    };
  }, []);

  const rows = data?.map((row: Data, index) =>
    createData(
      row?.admin_nominal,
      row?.admin_type_id,
      row?.admin_type_name,
      row?.biller_id,
      row?.biller_name,
      row?.denom,
      row?.harga_beli,
      row?.harga_jual,
      row?.harga_up,
      row?.id,
      row?.image,
      row?.keterangan,
      row?.komisi,
      row?.nama,
      row?.status,
      row?.product_biller_id,
      index,
    ),
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

  const handleDeleteData = async (id: string) => {
    const response = await dispatch(deleteProductsData(id));
    if (typeof response === 'boolean' && response) {
      dispatch(getMasterProductsData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const handleGetProductsGroupList = async (id: string) => {
    setLoadingGroupProductList(true);
    try {
      const response = await axios.get(`/v1/api/dashboard/product/list-group/${id}`);

      const responseData = response.data || [];

      setProductGroupNewFormList(responseData);
    } catch (e) {
      setProductGroupNewFormList([]);
    } finally {
      setLoadingGroupProductList(false);
    }
  };

  const productImage = useWatch({ control, name: 'image' });
  const productCategory = useWatch({ control, name: 'selectedProductCategory' });

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
            <Button color="success" size="small" variant="contained" onClick={handleClickOpen}>
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
                          <TableCell align="left">{row.biller_name || '-'}</TableCell>
                          <TableCell align="left">{currencyFormat(row.denom ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_beli ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_jual ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.harga_up ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.komisi ?? 0)}</TableCell>
                          <TableCell align="left">{currencyFormat(row.admin_nominal ?? 0)}</TableCell>
                          <TableCell align="left">{row.admin_type_name || '-'}</TableCell>

                          <TableCell align="center">
                            {row.status ? (
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
                                        adminNominal: row?.admin_nominal || 0,
                                        selectedAdminType: row?.admin_type_id ? `${row?.admin_type_id}` : '1',
                                        selectedBillerProduct: row?.product_biller_id
                                          ? `${row?.product_biller_id}`
                                          : '1',
                                        selectedBiller: row?.biller_id ? `${row?.biller_id}` : '',
                                        selectedProductGroup: categoryId === 'All' ? '' : `${groupId}`,
                                        denom: row?.denom || 0,
                                        buyPrice: row?.harga_beli || 0,
                                        sellPrice: row?.harga_jual || 0,
                                        upPrice: row?.harga_up || 0,
                                        id: row?.id || '',
                                        image: row?.image || '',
                                        notes: row?.keterangan || '',
                                        commission: row?.komisi || 0,
                                        name: row?.nama || '',
                                        status: row?.status || true,
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
                  name="id"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Product ID</label>
                      <TextField
                        {...field}
                        disabled={editForm}
                        fullWidth
                        placeholder="Type product ID"
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
                        placeholder="Type product name"
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
                  name="selectedBiller"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Biller</label>
                      <FormControl error={!!errors.selectedBiller} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="biller-select"
                          {...field}
                          placeholder="Choose biller"
                        >
                          <MenuItem disabled value="">
                            <em>Choose biller</em>
                          </MenuItem>
                          {billerList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.selectedBiller?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
                {!editForm ? (
                  <>
                    <Controller
                      control={control}
                      name="selectedProductCategory"
                      render={({ field }) => (
                        <div className="flex flex-col gap-3 w-full">
                          <label className="text-sm font-semibold">Product Category</label>
                          <FormControl error={!!errors.selectedProductCategory} required fullWidth>
                            <Select
                              input={<OutlinedInput />}
                              fullWidth
                              id="product-category-select"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                handleGetProductsGroupList(e.target.value);
                                setValue('selectedProductGroup', '');
                              }}
                            >
                              <MenuItem disabled value="">
                                <em>Choose product category</em>
                              </MenuItem>
                              {productCategoryList?.map((type) => (
                                <MenuItem key={type?.id} value={type?.id}>
                                  {type?.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </div>
                      )}
                    />
                    <Controller
                      control={control}
                      name="selectedProductGroup"
                      render={({ field }) => (
                        <div className="flex flex-col gap-3 w-full">
                          <label className="text-sm font-semibold">Product Group</label>
                          <FormControl error={!!errors.selectedProductGroup} required fullWidth>
                            <Select input={<OutlinedInput />} fullWidth id="product-group-select" {...field}>
                              <MenuItem disabled value="">
                                <em>{loadingGroupProductList ? 'Loading' : 'Choose product group'}</em>
                              </MenuItem>
                              {productGroupNewFormList?.map((type) => (
                                <MenuItem key={type?.id} value={type?.id}>
                                  {type?.name}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>
                              {loadingGroupProductList
                                ? 'Loading'
                                : productCategory && productGroupNewFormList?.length === 0
                                ? 'Pilihan Product Category tidak tersedia'
                                : !errors?.selectedProductGroup?.message && productGroupNewFormList?.length === 0
                                ? 'Diharuskan memilih Product Category terlebih dahulu'
                                : errors?.selectedProductGroup?.message}
                            </FormHelperText>
                          </FormControl>
                        </div>
                      )}
                    />
                  </>
                ) : (
                  <Controller
                    control={control}
                    name="selectedProductGroup"
                    render={({ field }) => (
                      <div className="flex flex-col gap-3 w-full">
                        <label className="text-sm font-semibold">Product Group</label>
                        <FormControl error={!!errors.selectedProductGroup} required fullWidth>
                          <Select
                            input={<OutlinedInput />}
                            fullWidth
                            id="product-group-select"
                            {...field}
                            placeholder="Choose product group"
                          >
                            {productGroupList?.map((type) => (
                              <MenuItem key={type?.id} value={type?.id}>
                                {type?.name}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{errors?.selectedProductGroup?.message}</FormHelperText>
                        </FormControl>
                      </div>
                    )}
                  />
                )}
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="image"
                  render={({ field: { onChange } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Choose Image</label>
                      <section className="flex gap-3 items-stretch">
                        <TextField
                          onChange={(event: ChangeEvent) => {
                            const target = event.target as HTMLInputElement;
                            const file: File = (target.files as FileList)[0];
                            onChange(file);
                          }}
                          placeholder="Choose image"
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
                  name="selectedAdminType"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Admin Type</label>
                      <FormControl error={!!errors.selectedAdminType} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="admin-type-select"
                          {...field}
                          placeholder="Choose admin type"
                        >
                          <MenuItem disabled value="">
                            <em>Choose admin type</em>
                          </MenuItem>
                          {formTypeList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.selectedAdminType?.message}</FormHelperText>
                      </FormControl>
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="selectedBillerProduct"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Biller Product Type</label>
                      <FormControl error={!!errors.selectedBillerProduct} required fullWidth>
                        <Select
                          input={<OutlinedInput />}
                          fullWidth
                          id="biller-type-select"
                          {...field}
                          placeholder="Choose biller product type"
                        >
                          <MenuItem disabled value="">
                            <em>Choose biller</em>
                          </MenuItem>
                          {formTypeList?.map((type) => (
                            <MenuItem key={type?.id} value={type?.id}>
                              {type?.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{errors?.selectedBillerProduct?.message}</FormHelperText>
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
                        maxRows={4}
                        placeholder="Type notes"
                        helperText={errors?.notes && errors.notes?.message}
                        error={!!errors?.notes}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="adminNominal"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Admin Nominal</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type product admin nominal"
                        helperText={errors?.adminNominal && errors.adminNominal?.message}
                        error={!!errors?.adminNominal}
                        type="number"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="denom"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Denom</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type denom"
                        helperText={errors?.denom && errors.denom?.message}
                        error={!!errors?.denom}
                        type="number"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="commission"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Komisi</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type commission"
                        helperText={errors?.commission && errors.commission?.message}
                        error={!!errors?.commission}
                        type="number"
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="sellPrice"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Sell Price</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type sell price"
                        helperText={errors?.sellPrice && errors.sellPrice?.message}
                        error={!!errors?.sellPrice}
                        type="number"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="buyPrice"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Buy Price</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type buy price"
                        helperText={errors?.buyPrice && errors.buyPrice?.message}
                        error={!!errors?.buyPrice}
                        type="number"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="upPrice"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Up Price</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type up price"
                        helperText={errors?.upPrice && errors.upPrice?.message}
                        error={!!errors?.upPrice}
                        type="number"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
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
