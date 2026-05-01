'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function setupUsername(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const raw = formData.get('username') as string
  const username = raw?.trim().toLowerCase()

  // Server-side validation
  if (!username) {
    redirect('/profile/setup?error=Username+is+required')
  }

  if (username.length < 3) {
    redirect('/profile/setup?error=Username+must+be+at+least+3+characters')
  }

  if (username.length > 20) {
    redirect('/profile/setup?error=Username+must+be+20+characters+or+less')
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect('/profile/setup?error=Only+lowercase+letters%2C+numbers+and+underscores+allowed')
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    redirect('/profile/setup?error=That+username+is+already+taken')
  }

  // Save username
  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id)

  if (error) {
    redirect('/profile/setup?error=Something+went+wrong+please+try+again')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function updateUsername(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const raw = formData.get('username') as string
  const username = raw?.trim().toLowerCase()

  if (!username) {
    redirect('/profile?error=Username+is+required')
  }

  if (username.length < 3) {
    redirect('/profile?error=Username+must+be+at+least+3+characters')
  }

  if (username.length > 20) {
    redirect('/profile?error=Username+must+be+20+characters+or+less')
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    redirect('/profile?error=Only+lowercase+letters%2C+numbers+and+underscores+allowed')
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) {
    redirect('/profile?error=That+username+is+already+taken')
  }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id)

  if (error) {
    redirect('/profile?error=Something+went+wrong+please+try+again')
  }

  revalidatePath('/', 'layout')
  redirect('/profile?message=Username+updated+successfully')
}