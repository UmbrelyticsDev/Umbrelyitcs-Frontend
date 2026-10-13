import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Box,
  Grid,
  Stack,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@material-ui/core'
import { Close as CloseIcon } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import * as XLSX from 'xlsx'
import toolAxios from 'src/_apis_/toolAxios'
import {
  detectFormat,
  parseList,
  parseGrid,
  buildCanonicalFromGrid,
  expandMerges,
} from 'src/utils/timetableImport'

// Independent teacher's website timetable import. Mirrors the tool's grid
// importer exactly (same parser, same /api/timetables/import endpoint via
// toolAxios), rendered in MUI to match the website.
export default function TimetableImportModal({ open, onClose, onImported }) {
  const { enqueueSnackbar } = useSnackbar()

  const [fileName, setFileName] = useState('')
  const [aoa, setAoa] = useState(null)
  const [readError, setReadError] = useState('')
  const [format, setFormat] = useState('auto')
  const [year, setYear] = useState(new Date().getFullYear())
  const [term, setTerm] = useState('Term 1')
  const [cellMeaning, setCellMeaning] = useState('subject')
  const [defaultGrade, setDefaultGrade] = useState('')
  const [defaultSubject, setDefaultSubject] = useState('')
  const [rowOverrides, setRowOverrides] = useState({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)

  const resetAll = () => {
    setFileName('')
    setAoa(null)
    setReadError('')
    setFormat('auto')
    setCellMeaning('subject')
    setDefaultGrade('')
    setDefaultSubject('')
    setRowOverrides({})
    setImporting(false)
    setResult(null)
  }

  const close = () => {
    resetAll()
    onClose?.()
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setReadError('')
    setResult(null)
    setRowOverrides({})
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { cellDates: false })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const grid = XLSX.utils.sheet_to_json(ws, {
        header: 1,
        raw: true,
        defval: null,
        blankrows: true,
      })
      const merges = (ws['!merges'] || []).map((m) => ({
        s: { r: m.s.r, c: m.s.c },
        e: { r: m.e.r, c: m.e.c },
      }))
      expandMerges(grid, merges)
      setAoa(grid)
    } catch (err) {
      console.error('Read error:', err)
      setReadError("Could not read the file. Make sure it's a valid .xlsx.")
      setAoa(null)
    }
  }

  const changeFormat = (val) => {
    setFormat(val)
    setRowOverrides({})
  }

  const parsed = useMemo(() => {
    if (!aoa) return null
    const fmt = format === 'auto' ? detectFormat(aoa) : format
    if (fmt === 'list') {
      const { rows, errors } = parseList(aoa)
      return { fmt, listRows: rows, errors, slots: [], ignoredLabels: [] }
    }
    const g = parseGrid(aoa)
    return { fmt, listRows: [], ...g }
  }, [aoa, format])

  const mapping = useMemo(
    () => ({ cellMeaning, defaultGrade, defaultSubject }),
    [cellMeaning, defaultGrade, defaultSubject],
  )

  const canonicalRows = useMemo(() => {
    if (!parsed) return []
    if (parsed.fmt === 'list') return parsed.listRows
    return buildCanonicalFromGrid(parsed.slots, mapping, rowOverrides)
  }, [parsed, mapping, rowOverrides])

  const validCount = canonicalRows.filter((r) => r.ok).length
  const isGrid = parsed?.fmt === 'grid'

  const setRowOverride = (i, field, val) => {
    setRowOverrides((prev) => ({ ...prev, [i]: { ...prev[i], [field]: val } }))
  }

  const runImport = async () => {
    const good = canonicalRows.filter((r) => r.ok)
    if (good.length === 0) {
      enqueueSnackbar(
        'No valid rows to import. Fix the highlighted problems first.',
        { variant: 'warning' },
      )
      return
    }
    setImporting(true)
    try {
      const payload = {
        academic_year: String(year).trim(),
        term,
        rows: good.map((r) => ({
          rowNo: r.rowNo,
          day: r.day,
          start: r.start,
          end: r.end,
          class_name: r.class_name,
          subject: r.subject,
          grade_level: r.grade_level,
          room: r.room || '',
        })),
      }
      const res = await toolAxios.post('/api/timetables/import', payload)
      setResult(res.data.data)
      enqueueSnackbar(res.data.message || 'Import complete', {
        variant: 'success',
      })
      onImported?.()
    } catch (err) {
      enqueueSnackbar(err.response?.data?.error || 'Import failed', {
        variant: 'error',
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const aoaT = [
      ['Day', 'Start Time', 'End Time', 'Class', 'Subject', 'Grade', 'Room'],
      ['Monday', '08:00', '08:45', '10A', 'Chemistry', 'Grade 10', 'Lab 1'],
      ['Monday', '09:00', '09:45', '9B', 'Mathematics', 'Grade 9', 'Room 12'],
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoaT)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable')
    XLSX.writeFile(wb, 'timetable_template.xlsx')
  }

  return (
    <Dialog open={open} onClose={close} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          Import Timetable
          <IconButton onClick={close}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This replaces <strong>all</strong> your classes and schedule for the
          selected academic year and term. Other terms are not affected.
        </Alert>

        {/* Year / Term / Template */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Academic Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g., 2025-2026"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <MenuItem value="Term 1">Term 1</MenuItem>
              <MenuItem value="Term 2">Term 2</MenuItem>
              <MenuItem value="Term 3">Term 3</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="outlined"
              onClick={downloadTemplate}
              sx={{ height: '100%' }}
            >
              Download List Template
            </Button>
          </Grid>
        </Grid>

        {/* File + Format */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Button variant="outlined" component="label">
              Choose .xlsx file
              <input
                type="file"
                hidden
                accept=".xlsx,.xls"
                onChange={handleFile}
              />
            </Button>
            {fileName && (
              <Typography
                variant="caption"
                sx={{ ml: 2, color: 'text.secondary' }}
              >
                {fileName}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Format"
              value={format}
              onChange={(e) => changeFormat(e.target.value)}
            >
              <MenuItem value="auto">
                Auto-detect{parsed ? ` (${parsed.fmt})` : ''}
              </MenuItem>
              <MenuItem value="list">List (template)</MenuItem>
              <MenuItem value="grid">Grid (days across top)</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {readError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {readError}
          </Alert>
        )}

        {parsed?.errors?.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {parsed.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Grid mapping controls */}
        {isGrid && parsed.slots.length > 0 && (
          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 2,
              mb: 2,
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Grid detected — set defaults, then fine-tune rows below
            </Typography>

            <RadioGroup
              row
              value={cellMeaning}
              onChange={(e) => setCellMeaning(e.target.value)}
              sx={{ mb: 1 }}
            >
              <FormControlLabel
                value="subject"
                control={<Radio size="small" />}
                label="Cells are subjects"
              />
              <FormControlLabel
                value="class"
                control={<Radio size="small" />}
                label="Cells are class/form codes"
              />
            </RadioGroup>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  size="small"
                  label={
                    cellMeaning === 'subject'
                      ? 'Default Grade (applied to all)'
                      : 'Default Grade (fallback)'
                  }
                  value={defaultGrade}
                  onChange={(e) => setDefaultGrade(e.target.value)}
                  placeholder="e.g., Grade 9"
                />
              </Grid>
              {cellMeaning === 'class' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Default Subject (when a cell has no subject)"
                    value={defaultSubject}
                    onChange={(e) => setDefaultSubject(e.target.value)}
                    placeholder="e.g., the subject you teach"
                  />
                </Grid>
              )}
            </Grid>

            {parsed.ignoredLabels.length > 0 && (
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 1, color: 'text.secondary' }}
              >
                Ignored as non-teaching: {parsed.ignoredLabels.join(', ')}
              </Typography>
            )}
          </Box>
        )}

        {/* Preview */}
        {canonicalRows.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
              Preview ({validCount} of {canonicalRows.length} slots valid)
            </Typography>
            {isGrid && (
              <Typography
                variant="caption"
                sx={{ display: 'block', mb: 1, color: 'text.secondary' }}
              >
                Each row is its own slot — editing one never changes another.
                Rows that share a Class name become one class with multiple
                sessions; give a row a different Class name to split it off.
              </Typography>
            )}
            <Box sx={{ maxHeight: 320, overflow: 'auto' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Start</TableCell>
                    <TableCell>End</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Subject</TableCell>
                    <TableCell>Grade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {canonicalRows.map((r, i) => (
                    <TableRow
                      key={i}
                      sx={!r.ok ? { bgcolor: 'error.lighter' } : undefined}
                    >
                      <TableCell>{r.day || '—'}</TableCell>
                      <TableCell>{r.start || '—'}</TableCell>
                      <TableCell>{r.end || '—'}</TableCell>
                      {isGrid ? (
                        <>
                          <TableCell>
                            <TextField
                              variant="standard"
                              size="small"
                              value={r.class_name}
                              error={!r.class_name}
                              onChange={(e) =>
                                setRowOverride(i, 'class_name', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              variant="standard"
                              size="small"
                              value={r.subject}
                              error={!r.subject}
                              onChange={(e) =>
                                setRowOverride(i, 'subject', e.target.value)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              variant="standard"
                              size="small"
                              value={r.grade_level}
                              error={!r.grade_level}
                              onChange={(e) =>
                                setRowOverride(i, 'grade_level', e.target.value)
                              }
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{r.class_name || '—'}</TableCell>
                          <TableCell>{r.subject || '—'}</TableCell>
                          <TableCell>{r.grade_level || '—'}</TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Box>
        )}

        {/* Result */}
        {result && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Imported {result.classes_created} class(es) and{' '}
            {result.slots_created} scheduled slot(s).
            {result.warnings && result.warnings.length > 0 && (
              <Box
                component="ul"
                sx={{ m: 0, mt: 1, pl: 2, maxHeight: 120, overflow: 'auto' }}
              >
                {result.warnings.map((w, i) => (
                  <li key={i}>
                    <Typography variant="caption">{w}</Typography>
                  </li>
                ))}
              </Box>
            )}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={close}>
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button
            variant="contained"
            sx={{ color: '#fff' }}
            onClick={runImport}
            disabled={importing || validCount === 0}
          >
            {importing ? 'Importing...' : `Import ${validCount} slot(s)`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
