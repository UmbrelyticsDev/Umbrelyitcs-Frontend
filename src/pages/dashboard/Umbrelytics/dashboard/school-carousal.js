
import React, { useEffect } from 'react';
import Slider from 'react-slick';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import { alpha, useTheme, experimentalStyled as styled } from '@material-ui/core/styles';
import { CardContent, Box, Card, Typography, Stack, Grid, CircularProgress, Paper } from '@material-ui/core';
// utils
import { mockImgFeed } from '../../../../utils/mockImages';
import Image1 from '../../../../../src/images/jamaica-high-school-cover.jpg'
import Image2 from '../../../../../src/images/york-castle.jpg'
import Image3 from '../../../../../src/images/rusea-high-school.jpg'
//


import { MotionContainer, varFadeInRight } from 'src/components/animate';
import { CarouselControlsArrowsBasic1, CarouselControlsPaging1 } from 'src/components/carousel';
import { LocationOn } from '@material-ui/icons';

// Carousel image style
const CarouselImgStyle = styled('img')(({ theme }) => ({
  height: 280,
  width: '100%',
  objectFit: 'cover',
  [theme.breakpoints.up('xl')]: {
    height: 320
  }
}));

// Carousel Item PropTypes
CarouselItem.propTypes = {
  item: PropTypes.object,
  isActive: PropTypes.bool
};

// Carousel Item component
function CarouselItem({ item, isActive }) {
  const { school_image, school_name, location } = item;

  return (
    <RouterLink to="#">
      <Box sx={{ position: 'relative' }}>
        <Box
          sx={{
            top: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72)
          }}
        />
        <CarouselImgStyle alt={school_name} src={school_image} />
        <CardContent
          sx={{
            bottom: 0,
            width: '100%',
            textAlign: 'left',
            position: 'absolute',
            color: 'common.white'
          }}
        >
          <MotionContainer open={isActive}>
            <motion.div variants={varFadeInRight}>
              <Typography
                variant="overline"
                sx={{
                  mb: 1,
                  opacity: 0.48,
                  display: 'block'
                }}
              >
                Popular Schools
              </Typography>
            </motion.div>
            <motion.div variants={varFadeInRight}>
              <Typography variant="h5" gutterBottom noWrap>
                {school_name}
              </Typography>
            </motion.div>
            <motion.div variants={varFadeInRight}>
              <Stack direction="row" alignItems="center">
                <Stack className='fluent--location-20-regular' sx={{ fontSize: '1.1rem', mr: 0.3, mt: -0.3 }} />
                <Box>
                  <Typography variant="body2" noWrap>
                    {location}
                  </Typography>
                </Box>
              </Stack>
            </motion.div>
          </MotionContainer>
        </CardContent>
      </Box>
    </RouterLink>
  );
}

export default function SchoolCarousel({ data }) {
  const theme = useTheme();
  const carouselRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(theme.direction === 'rtl' ? (data?.latestSchools?.length || 0) - 1 : 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const settings = {
    speed: 800,
    dots: true,
    arrows: false,
    autoplay: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    rtl: Boolean(theme.direction === 'rtl'),
    beforeChange: (current, next) => setCurrentIndex(next),
    ...CarouselControlsPaging1({
      color: 'primary.main',
      sx: {
        top: theme.spacing(3),
        left: theme.spacing(3),
        bottom: 'auto',
        right: 'auto'
      }
    })
  };

  const handlePrevious = () => {
    carouselRef.current.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current.slickNext();
  };

  return (
    <Card>
      {loading ? (
        <Grid>
          <Paper sx={{ p: 4, minHeight: 160, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ width: '100%' }}>
              <MLinearProgress color='inherit' />
              <MLinearProgress color='warning' sx={{ mt: 2 }} />
              <MLinearProgress color='success' sx={{ mt: 2 }} />
              <MLinearProgress color='inherit' sx={{ mt: 2 }} />
            </Box>
          </Paper>
        </Grid>
      ) : (
        <>
          <Slider ref={carouselRef} {...settings}>
            {data?.latestSchools?.length > 0 ? (
              data.latestSchools.map((item, index) => (
                <CarouselItem key={item.id} item={item} isActive={index === currentIndex} />
              ))
            ) : (
              <Typography variant="h6" align="center" sx={{ p: 2 }}>
                No Schools Available
              </Typography>
            )}
          </Slider>
          <CarouselControlsArrowsBasic1 onNext={handleNext} onPrevious={handlePrevious} />
        </>
      )}
    </Card>
  );
}
