import PropTypes from 'prop-types';
// material
import { visuallyHidden } from '@material-ui/utils';
import { Box, Checkbox, TableRow, TableCell, TableHead, TableSortLabel } from '@material-ui/core';
import { useLocation } from 'react-router';

// ----------------------------------------------------------------------

const user_type = JSON.parse(localStorage.getItem('user_type'));
console.log('user_type', user_type);


SubjectListingHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  headLabel: PropTypes.array,
  numSelected: PropTypes.number,
  onRequestSort: PropTypes.func,
  onSelectAllClick: PropTypes.func
};

export default function SubjectListingHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };
  const location = useLocation();
  const isDepartmentDetailsPage = location.pathname === "/dashboard/schools/department/department-subject-listing";
  console.log('kkkkkkkkkk',isDepartmentDetailsPage);

  return (
    <TableHead>
      <TableRow>
        {user_type !== 3 && user_type !== 4 && (<TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>)}
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
