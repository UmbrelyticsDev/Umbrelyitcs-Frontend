import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core'
import { Icon } from '@iconify/react'
import chevronDown from '@iconify/icons-eva/chevron-down-fill'
import Page from '../../../../components/Page'
import axios from 'axios'
import { REST_API_END_POINT } from 'src/constants/Defaultvalues'

// ---- file-type helpers (unchanged) ----
const getFileType = (url) => {
  if (!url) return 'unknown'
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.pdf')) return 'pdf'
  if (/\.(docx?|pptx?|xlsx?)$/.test(clean)) return 'office'
  if (/\.(jpg|jpeg|png|gif|webp|jfif|bmp|svg)$/.test(clean)) return 'image'
  return 'unknown'
}

const TypeBadge = ({ type }) => {
  const map = { pdf: 'PDF', office: 'DOC', image: 'IMAGE', unknown: 'FILE' }
  const color = {
    pdf: 'error',
    office: 'primary',
    image: 'success',
    unknown: 'default',
  }
  return <Chip size="small" label={map[type]} color={color[type]} />
}

const AnalyticsPreview = ({ url }) => {
  const type = getFileType(url)
  if (type === 'pdf')
    return (
      <iframe
        title="preview"
        src={url}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
      />
    )
  if (type === 'office')
    return (
      <iframe
        title="preview"
        src={`https://docs.google.com/viewer?url=${encodeURIComponent(
          url,
        )}&embedded=true`}
        width="100%"
        height="600px"
        style={{ border: 'none' }}
      />
    )
  if (type === 'image')
    return (
      <img
        src={url}
        alt="analytics"
        style={{ width: '100%', height: 'auto' }}
      />
    )
  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography sx={{ mb: 2 }}>
        Preview not available for this file type.
      </Typography>
      <Button variant="contained" href={url} target="_blank">
        Open / Download
      </Button>
    </Box>
  )
}

export default function DashboardAnalytics() {
  const user = JSON.parse(localStorage.getItem('user'))
  // Each item: { id, label, analytics: [...] }
  const [subjectItems, setSubjectItems] = useState([])
  const [classItems, setClassItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)

      // ---- Teacher's subjects ----
      let subjectCsv = ''
      try {
        const teacherRes = await axios.get(
          `${REST_API_END_POINT}get-teacher-details-for-editing/${user.teacherId}`,
        )
        if (teacherRes.data.status === 1)
          subjectCsv = teacherRes.data.result?.subjects || ''
      } catch (e) {
        console.log('teacher fetch failed', e)
      }

      const subjectIds = subjectCsv
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      const subjResults = await Promise.all(
        subjectIds.map(async (sid) => {
          let label = `Subject ${sid}`
          let analytics = []
          try {
            // subject name
            const subRes = await axios.get(
              `${REST_API_END_POINT}get-subject-for-updating/${sid}`,
            )
            if (subRes.data.status === 1)
              label = subRes.data.result?.subjectName || label
          } catch {}
          try {
            const aRes = await axios.get(
              `${REST_API_END_POINT}get-subject-analytics/${sid}`,
            )
            if (aRes.data.status === 1) analytics = aRes.data.result || []
          } catch {}
          return { id: sid, label, analytics }
        }),
      )
      setSubjectItems(subjResults)

      // ---- Teacher's classes (already enriched with gradeName/subjectName) ----
      const classRes = await axios.post(
        `${REST_API_END_POINT}class/get-class-by-teacher-id`,
        { teacherId: user.teacherId },
      )
      const classes = classRes.data.status === 1 ? classRes.data.data : []
      const classResults = await Promise.all(
        classes.map(async (cls) => {
          let analytics = []
          try {
            const aRes = await axios.get(
              `${REST_API_END_POINT}get-class-analytics/${cls.id}`,
            )
            if (aRes.data.status === 1) analytics = aRes.data.result || []
          } catch {}
          const label = `${cls.name}${
            cls.subjectName || cls.gradeName
              ? ` (${[cls.subjectName, cls.gradeName]
                  .filter(Boolean)
                  .join(' • ')})`
              : ''
          }`
          return { id: cls.id, label, analytics }
        }),
      )
      setClassItems(classResults)
    } catch (err) {
      console.log('Error loading analytics', err)
    } finally {
      setLoading(false)
    }
  }

  // Renders the document cards for one item's analytics
  const renderDocs = (analytics) =>
    analytics.length === 0 ? (
      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>
        No analytics available.
      </Typography>
    ) : (
      <Grid container spacing={2}>
        {analytics.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }}
              onClick={() => setSelected(item)}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {item.analyticsName}
                  </Typography>
                  <TypeBadge type={getFileType(item.analyticsImage)} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {item.analyticsuploadedTime}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )

  // Renders a category: a list of item-accordions
  const renderCategory = (items) =>
    items.length === 0 ? (
      <Typography color="text.secondary" sx={{ pl: 2, py: 1 }}>
        Nothing available yet.
      </Typography>
    ) : (
      items.map((item) => (
        <Accordion
          key={item.id}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<Icon icon={chevronDown} />}>
            <Typography variant="subtitle1">
              {item.label}
              {item.analytics.length > 0 && (
                <Chip
                  size="small"
                  label={item.analytics.length}
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>{renderDocs(item.analytics)}</AccordionDetails>
        </Accordion>
      ))
    )

  return (
    <Page title="Analytics | Umbrelytics">
      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Analytics
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Top-level: Subject Analytics */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<Icon icon={chevronDown} />}>
                <Typography variant="h6">Subject Analytics</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ display: 'block' }}>
                {renderCategory(subjectItems)}
              </AccordionDetails>
            </Accordion>

            {/* Top-level: Class Analytics */}
            <Accordion>
              <AccordionSummary expandIcon={<Icon icon={chevronDown} />}>
                <Typography variant="h6">Class Analytics</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ display: 'block' }}>
                {renderCategory(classItems)}
              </AccordionDetails>
            </Accordion>
          </>
        )}

        {/* Preview modal (unchanged) */}
        <Dialog
          open={!!selected}
          onClose={() => setSelected(null)}
          maxWidth="md"
          fullWidth
        >
          {selected && (
            <>
              <DialogTitle>{selected.analyticsName}</DialogTitle>
              <DialogContent dividers>
                <AnalyticsPreview url={selected.analyticsImage} />
              </DialogContent>
              <DialogActions>
                <Button href={selected.analyticsImage} target="_blank">
                  Open in new tab
                </Button>
                <Button onClick={() => setSelected(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Page>
  )
}
