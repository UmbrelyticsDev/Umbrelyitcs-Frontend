import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Grid,
} from '@material-ui/core'
import toolAxios from 'src/_apis_/toolAxios'

// Dashboard section: the teacher's most recent research notes (the same store
// behind the floating notebook and Action Research). Self-contained — drop
// <RecentNotes /> into the dashboard.
const SHOW = 6

export default function RecentNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    toolAxios
      .get('/api/teachers/research-notes')
      .then((r) => {
        if (active) setNotes(r.data?.data || [])
      })
      .catch((e) => console.log('Failed to load notes', e))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const recent = notes.slice(0, SHOW)

  return (
    <Box sx={{ mb: 4 }}>
      {/* Section header */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Recent Notes
      </Typography>

      {loading ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Loading notes…
        </Typography>
      ) : recent.length === 0 ? (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No notes yet. Jot one down in the Research Notebook.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {recent.map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  {n.title && (
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {n.title}
                    </Typography>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      mt: n.title ? 0.5 : 0,
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {n.content}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1.5, flexWrap: 'wrap' }}
                  >
                    {n.class_name && (
                      <Chip
                        label={n.class_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.disabled' }}
                    >
                      {new Date(n.created_at).toLocaleDateString()}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}
