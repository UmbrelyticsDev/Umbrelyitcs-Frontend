import { last } from 'lodash';
import PropTypes from 'prop-types';
// material
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Typography, Box, Link, Breadcrumbs } from '@material-ui/core';
import { ArrowRightAlt } from '@material-ui/icons';

// ----------------------------------------------------------------------

const Separator = <ArrowRightAlt />;

LinkItem.propTypes = {
  link: PropTypes.object
};

function LinkItem({ link }) {
  const { href, name, icon, state } = link;
  const queryParams = state ? new URLSearchParams(state).toString() : '';
  const fullHref = queryParams ? `${href}?${queryParams}` : href;
  return (
    <Link
      to={fullHref}
      key={name}
      variant="body2"
      component={RouterLink}
      sx={{
        lineHeight: 2,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary' ,
        '& > div': { display: 'inherit' }
      }}
    >
      {icon && (
        <Box
          sx={{
            mr: 1,
            '& svg': { width: 20, height: 20 }
          }}
        >
          {icon}
        </Box>
      )}
      {name}
    </Link>
  );
}

MBreadcrumbs.propTypes = {
  links: PropTypes.array.isRequired,
  activeLast: PropTypes.bool
};

export default function MBreadcrumbs({ links, activeLast = false, ...other }) {
  const currentLink = last(links).name;
  const location = useLocation();
  const isSchoolAdminLogin = location.pathname === "/dashboard/school-details";

  const listDefault = links.map((link) => <LinkItem key={link.name} link={link} />);
  const listActiveLast = links.map((link) => (
    <>
    {!isSchoolAdminLogin ? (<div key={link.name}>
      {link.name !== currentLink ? (
        <>
        <LinkItem link={link} />
        </>
      ) : (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis'
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>) : <div key={link.name}>
      {link.name !== currentLink ? (
        <>
        <Typography variant="body2"
        sx={{
          maxWidth: 260,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          color: 'text.disabled',
          textOverflow: 'ellipsis'
        }}>School Details</Typography>
        </>
      ) : (
        <LinkItem 
        link={link} />
      )}
    </div>}
    </>
  ));

  return (
    <Breadcrumbs separator={Separator} {...other}>
      {activeLast ? listDefault : listActiveLast}
    </Breadcrumbs>
  );
}
