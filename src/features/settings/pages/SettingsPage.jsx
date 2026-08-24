import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import {
  Clock3,
  ExternalLink,
  Settings2,
  ShieldCheck,
  User,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

import { storage } from '../../../services/storage.js'
import { settingsService } from '../../../shared/api/settings.service.js'
import { getApiMessage } from '../../../shared/utils/apiResponse.js'
import useUIStore from '../../../shared/store/ui.store.js'
import { BusinessDetails } from '../components/settings/BusinessDetails'
import { AccountVerification } from '../components/settings/AccountVerification'
import { AppearanceSettings } from '../components/settings/AppearanceSettings'
import { ContactSupport } from '../components/settings/ContactSupport'
import { Others } from '../components/settings/Others'
import { WorkingHours } from '../components/settings/WorkingHours'
import { SubscriptionSettings } from '../components/settings/SubscriptionSettings'
import { Toggle } from '../components/settings/SettingsUI'
import { BUSINESS_DETAILS_SUBS } from '../components/settings/businessDetails.config.js'
import {
  ACCOUNT_MGMT_SUBS,
  ChangePassword,
  ChangeEmail,
  Notifications,
  DeleteAccountSection,
} from '../components/settings/AccountManagement'

const NAV = [
  { key: 'business-details', label: 'Business details', Icon: User, children: BUSINESS_DETAILS_SUBS },
  { key: 'available-to-work', label: 'Available to work', type: 'toggle' },
  { key: 'working-hours', label: 'Working hours', Icon: Clock3 },
  { key: 'account-verification', label: 'Account verification', Icon: ShieldCheck },
  {
    key: 'account-management', label: 'Account management', Icon: Settings2,
    children: ACCOUNT_MGMT_SUBS,
  },
  { key: 'others', label: 'Others', Icon: ExternalLink },
]

const ARTISAN_ONLY_KEYS = new Set(['available-to-work', 'working-hours', 'my-subscription'])

function normalizeRoleTokens(role) {
  if (Array.isArray(role)) return role.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
  return String(role ?? '')
    .split(/[,\s|/]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

function isArtisanRole(role) {
  return normalizeRoleTokens(role).includes('artisan')
}

function getVisibleBusinessSubs(role) {
  return isArtisanRole(role)
    ? BUSINESS_DETAILS_SUBS
    : BUSINESS_DETAILS_SUBS.filter((item) => item.key !== 'my-service')
}

function getVisibleNav(role) {
  const visibleBusinessSubs = getVisibleBusinessSubs(role)
  const visibleAccountSubs = ACCOUNT_MGMT_SUBS.filter((item) => (
    item.key !== 'my-subscription' || isArtisanRole(role)
  ))

  return NAV
    .filter((item) => (isArtisanRole(role) ? true : !ARTISAN_ONLY_KEYS.has(item.key)))
    .map((item) => (
      item.key === 'business-details'
        ? { ...item, children: visibleBusinessSubs }
        : item.key === 'account-management'
          ? { ...item, children: visibleAccountSubs }
        : item
    ))
}

function ContentPanel({
  activeKey,
  activeSub,
  businessSub,
  data,
  pending,
  actions,
}) {
  const role = data.account?.account_type || data.account?.role
  const isArtisan = isArtisanRole(role)

  switch (activeKey) {
    case 'business-details':
      return (
        <BusinessDetails
          activeSub={businessSub}
          account={data.account}
          profile={data.profile}
          categories={data.categories}
          cities={data.cities}
          services={data.services}
          portfolio={data.portfolio}
          pending={pending}
          onSaveProfile={actions.saveProfile}
          onSaveService={actions.saveService}
          onCreatePortfolio={actions.createPortfolio}
        />
      )
    case 'working-hours':
      if (!isArtisan) return null
      return (
        <WorkingHours
          rules={data.availabilityRules}
          timezoneName={data.settings?.timezone_name}
          isPending={pending.availability}
          onSave={actions.saveAvailabilityRules}
        />
      )
    case 'account-verification': return <AccountVerification isArtisan={isArtisan} />
    case 'account-management':
      switch (activeSub) {
        case 'change-password': return <ChangePassword />
        case 'my-subscription':
          return isArtisan ? <SubscriptionSettings /> : null
        case 'appearance-settings':
          return (
            <AppearanceSettings
              settings={data.settings}
              isPending={pending.settings}
              onSave={actions.saveSettings}
            />
          )
        case 'contact-support': return <ContactSupport />
        case 'change-email': return <ChangeEmail />
        case 'notifications': return <Notifications />
        case 'delete-account': return <DeleteAccountSection />
        default: return <ChangePassword />
      }
    case 'others': return <Others />
    default:
      return (
        <BusinessDetails
          activeSub={businessSub}
          account={data.account}
          profile={data.profile}
          categories={data.categories}
          cities={data.cities}
          services={data.services}
          portfolio={data.portfolio}
          pending={pending}
          onSaveProfile={actions.saveProfile}
          onSaveService={actions.saveService}
          onCreatePortfolio={actions.createPortfolio}
        />
      )
  }
}

function SidebarItem({
  item,
  activeKey,
  activeSub,
  businessSub,
  availableToWork,
  onAvailableToWorkChange,
  onSelect,
  onSubSelect,
  onBusinessSubSelect,
  isExpanded,
  onToggle,
  onAfterSelect,
}) {
  if (item.type === 'toggle') {
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: '14px',
          background: 'var(--color-mist)',
        }}
      >
        <span style={{ fontSize: '14px', color: 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }}>{item.label}</span>
        <Toggle checked={availableToWork} onChange={onAvailableToWorkChange} />
      </div>
    )
  }

  const isActive = activeKey === item.key
  const children = item.children ?? []
  const hasChildren = children.length > 0
  const childActiveKey = item.key === 'business-details' ? businessSub : activeSub

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            onToggle(item.key)
            onSelect(item.key)
          } else {
            onSelect(item.key)
            onAfterSelect?.()
          }
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderRadius: '14px',
          background: isActive ? 'var(--color-primary)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(event) => {
          if (!isActive) event.currentTarget.style.background = 'var(--color-mist)'
        }}
        onMouseLeave={(event) => {
          if (!isActive) event.currentTarget.style.background = 'transparent'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <item.Icon size={17} color={isActive ? 'var(--color-white)' : 'var(--color-text-4)'} />
          <span style={{ fontSize: '14px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--color-white)' : 'var(--color-text-2)', fontFamily: 'var(--ff-body)' }}>
            {item.label}
          </span>
        </div>
        {hasChildren ? <ChevronDown size={14} color={isActive ? 'var(--color-white)' : 'var(--color-text-4)'} style={{ transform: `rotate(${isExpanded ? 180 : 0}deg)`, transition: 'transform 0.2s' }} /> : null}
      </button>

      {hasChildren && isExpanded ? (
        <div style={{ overflow: 'hidden' }}>
          <div style={{ paddingLeft: '20px', paddingTop: '8px', paddingBottom: '6px' }}>
            {children.map((sub) => {
              const subActive = isActive && childActiveKey === sub.key
              return (
                <button
                  key={sub.key}
                  onClick={() => {
                    if (item.key === 'business-details') onBusinessSubSelect(sub.key)
                    else onSubSelect(sub.key)
                    onAfterSelect?.()
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '10px 14px',
                    fontSize: '13.5px',
                    fontWeight: subActive ? 700 : 400,
                    color: subActive ? 'var(--color-accent-gold)' : 'var(--color-text-3)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--ff-body)',
                    borderLeft: subActive ? '2px solid var(--color-accent-gold)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(event) => {
                    if (!subActive) event.currentTarget.style.color = 'var(--color-text-1)'
                  }}
                  onMouseLeave={(event) => {
                    if (!subActive) event.currentTarget.style.color = 'var(--color-text-3)'
                  }}
                >
                  {sub.label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function buildPendingState() {
  return {
    page: false,
    profile: false,
    settings: false,
    service: false,
    portfolio: false,
    availability: false,
  }
}

function getSectionLabel(activeKey, activeSub, businessSub, visibleNav) {
  const currentItem = visibleNav.find((item) => item.key === activeKey)
  if (!currentItem) return 'Settings'

  if (activeKey === 'business-details') {
    const sub = currentItem.children?.find((item) => item.key === businessSub)
    return sub ? `${currentItem.label} / ${sub.label}` : currentItem.label
  }

  if (activeKey === 'account-management') {
    const sub = currentItem.children?.find((item) => item.key === activeSub)
    return sub ? `${currentItem.label} / ${sub.label}` : currentItem.label
  }

  return currentItem.label
}

export default function SettingsPage() {
  const { toastSuccess, toastError } = useUIStore()
  const [searchParams] = useSearchParams()
  const requestedSection = searchParams.get('section')
  const [activeKey, setActiveKey] = useState('business-details')
  const [activeSub, setActiveSub] = useState('change-password')
  const [businessSub, setBusinessSub] = useState('contact-details')
  const [expandedKey, setExpandedKey] = useState('business-details')
  const [pending, setPending] = useState(buildPendingState)
  const [data, setData] = useState({
    account: null,
    profile: null,
    settings: null,
    categories: [],
    cities: [],
    services: [],
    portfolio: [],
    availabilityRules: [],
  })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const role = data.account?.account_type || data.account?.role
  const visibleBusinessSubs = useMemo(() => getVisibleBusinessSubs(role), [role])
  const visibleNav = useMemo(() => getVisibleNav(role), [role])
  const firstVisibleBusinessSub = visibleBusinessSubs[0]?.key || 'contact-details'
  const firstVisibleNavKey = visibleNav[0]?.key || 'business-details'
  const activeSectionLabel = useMemo(
    () => getSectionLabel(activeKey, activeSub, businessSub, visibleNav),
    [activeKey, activeSub, businessSub, visibleNav]
  )

  const availableToWork = useMemo(
    () => (data.availabilityRules ?? []).some((rule) => rule.status !== 'unavailable'),
    [data.availabilityRules]
  )

  const setPendingFlag = (key, value) => {
    setPending((current) => ({ ...current, [key]: value }))
  }

  const closeMobileNav = () => setMobileNavOpen(false)

  const loadPageData = async () => {
    setPendingFlag('page', true)

    try {
      const storedCountryId = storage.getUser()?.country_id ?? storage.getUser()?.registration_country_id
      const [account, profile, settings, categories, cities, services, portfolio, availabilityRules] = await Promise.all([
        settingsService.getAuthMe(),
        settingsService.getProfile(),
        settingsService.getSettings(),
        settingsService.getCategories().catch(() => []),
        settingsService.getCities({ countryId: storedCountryId }).catch(() => []),
        settingsService.getMyServices().catch(() => []),
        settingsService.getPortfolio().catch(() => []),
        settingsService.getAvailabilityRules().catch(() => []),
      ])

      const storedUser = storage.getUser()
      const accountData = { ...storedUser, ...(account?.account || account) }

      setData({
        account: accountData,
        profile,
        settings,
        categories,
        cities,
        services,
        portfolio,
        availabilityRules,
      })
    } catch (error) {
      toastError(error.message || 'Failed to load settings page data.')
    } finally {
      setPendingFlag('page', false)
    }
  }

  useEffect(() => {
    loadPageData()
  }, [])

  useEffect(() => {
    if (!requestedSection) return

    const accountManagementItem = visibleNav.find((item) => item.key === 'account-management')
    const requestedAccountSub = accountManagementItem?.children?.find((item) => item.key === requestedSection)
    const canShowRequestedSection = visibleNav.some((item) => item.key === requestedSection)
    if (requestedAccountSub) {
      setActiveKey('account-management')
      setActiveSub(requestedAccountSub.key)
      setExpandedKey('account-management')
      return
    }

    if (canShowRequestedSection) {
      setActiveKey(requestedSection)
      setExpandedKey(requestedSection)
    }
  }, [requestedSection, visibleNav])

  useEffect(() => {
    const requestedNavItem = NAV.find((item) => item.key === requestedSection)
    const isWaitingForRequestedSection = Boolean(pending.page && requestedNavItem)

    if (!visibleNav.some((item) => item.key === activeKey) && !isWaitingForRequestedSection) {
      setActiveKey(firstVisibleNavKey)
    }

    if (!visibleBusinessSubs.some((item) => item.key === businessSub)) {
      setBusinessSub(firstVisibleBusinessSub)
    }

    if (expandedKey && !visibleNav.some((item) => item.key === expandedKey)) {
      setExpandedKey('business-details')
    }
  }, [activeKey, businessSub, expandedKey, firstVisibleBusinessSub, firstVisibleNavKey, pending.page, requestedSection, visibleBusinessSubs, visibleNav])

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileNavOpen])

  const handleSelect = (key) => {
    setActiveKey(key)
    if (key === 'business-details' && !visibleBusinessSubs.some((item) => item.key === businessSub)) {
      setBusinessSub(firstVisibleBusinessSub)
    }
    if (key === 'account-management' && !activeSub) setActiveSub('change-password')
  }

  const handleToggle = (key) => {
    setExpandedKey((previous) => (previous === key ? null : key))
  }

  const handleSubSelect = (sub) => {
    setActiveSub(sub)
    setActiveKey('account-management')
    setExpandedKey('account-management')
  }

  const handleBusinessSubSelect = (sub) => {
    setBusinessSub(sub)
    setActiveKey('business-details')
    setExpandedKey('business-details')
  }

  const handleAvailableToWorkChange = (checked) => {
    setData((current) => {
      const rules = current.availabilityRules.length
        ? current.availabilityRules.map((rule) => ({
          ...rule,
          status: checked ? 'available' : 'unavailable',
        }))
        : [
          {
            weekday_number: 1,
            start_time: '09:00:00',
            end_time: '17:00:00',
            timezone_name: current.settings?.timezone_name || 'Africa/Lagos',
            status: checked ? 'available' : 'unavailable',
          },
        ]

      return {
        ...current,
        availabilityRules: rules,
      }
    })
  }

  const saveProfile = async (payload) => {
    setPendingFlag('profile', true)
    try {
      const response = await settingsService.updateProfile(payload)
      // The PATCH response is partial (only the fields sent). Refetch the full
      // profile so untouched fields (date of birth, gender, default city) are not
      // dropped from the interface. See correction §5.
      const profile = await settingsService.getProfile().catch(() => response.profile)
      setData((current) => ({ ...current, profile }))
      toastSuccess(getApiMessage(response, 'Profile updated.'))
    } catch (error) {
      toastError(error.message || 'Failed to update profile.')
    } finally {
      setPendingFlag('profile', false)
    }
  }

  const saveSettings = async (payload) => {
    setPendingFlag('settings', true)
    try {
      const response = await settingsService.updateSettings(payload)
      setData((current) => ({ ...current, settings: response.settings }))
      toastSuccess(getApiMessage(response, 'Settings updated.'))
    } catch (error) {
      toastError(error.message || 'Failed to update settings.')
    } finally {
      setPendingFlag('settings', false)
    }
  }

  const saveService = async (payload) => {
    setPendingFlag('service', true)
    try {
      const { id, ...body } = payload
      const response = payload.id
        ? await settingsService.updateMyService(payload.id, body)
        : await settingsService.createMyService(body)
      const updatedService = response.item

      setData((current) => {
        const nextServices = payload.id
          ? current.services.map((service) => (service.id === payload.id ? { ...service, ...updatedService } : service))
          : [updatedService, ...current.services]

        return { ...current, services: nextServices }
      })

      toastSuccess(getApiMessage(response, payload.id ? 'Service updated.' : 'Service created.'))
    } catch (error) {
      toastError(error.message || 'Failed to save service.')
    } finally {
      setPendingFlag('service', false)
    }
  }

  const createPortfolio = async (payload) => {
    setPendingFlag('portfolio', true)
    try {
      const response = await settingsService.createPortfolioItem(payload)
      setData((current) => ({ ...current, portfolio: [response.item, ...current.portfolio] }))
      toastSuccess(getApiMessage(response, 'Portfolio item created.'))
    } catch (error) {
      toastError(error.message || 'Failed to create portfolio item.')
    } finally {
      setPendingFlag('portfolio', false)
    }
  }

  const saveAvailabilityRules = async (rules) => {
    setPendingFlag('availability', true)
    try {
      const normalizedRules = rules.map((rule) => ({
        ...rule,
        status: rule.status || 'available',
        timezone_name: rule.timezone_name || data.settings?.timezone_name || 'Africa/Lagos',
      }))

      // Use POST /availability/rules for ALL days (both available and unavailable).
      // The API accepts status: 'available' | 'unavailable' on the rules endpoint.
      const ruleResponses = await Promise.all(
        normalizedRules.map((rule) => settingsService.upsertAvailabilityRule(rule))
      )

      // Re-fetch fresh rules from the API so the UI reflects what was actually saved.
      const freshRules = await settingsService.getAvailabilityRules().catch(() => data.availabilityRules)

      setData((current) => ({
        ...current,
        availabilityRules: freshRules,
      }))

      toastSuccess(getApiMessage(ruleResponses.at(-1), 'Availability updated.'))
    } catch (error) {
      toastError(error.message || 'Failed to update availability.')
    } finally {
      setPendingFlag('availability', false)
    }
  }

  const actions = {
    saveProfile,
    saveSettings,
    saveService,
    createPortfolio,
    saveAvailabilityRules,
  }

  return (
    <div className="mx-auto flex h-full max-w-screen-xl flex-col p-4 sm:p-6 lg:p-8">
      <div className="mb-5 flex items-center justify-between gap-4 sm:mb-6">
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-1)' }}>Settings</h1>
          <p className="mt-1 text-sm lg:hidden" style={{ color: 'var(--color-text-3)' }}>
            {activeSectionLabel}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 lg:hidden"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-1)' }}
        >
          <Menu size={18} />
          <span className="text-sm font-semibold">Menu</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6" style={{ alignItems: 'stretch' }}>
        <aside
          className="hidden lg:block"
          style={{
            background: 'var(--color-surface)',
            borderRadius: '24px',
            border: '1px solid var(--color-border)',
            padding: '18px',
            boxShadow: 'var(--shadow-sm)',
            height: 'calc(100vh - 190px)',
            position: 'sticky',
            top: '24px',
            alignSelf: 'start',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', overflowY: 'auto', paddingRight: '4px' }}>
            {visibleNav.map((item) => (
              <SidebarItem
                key={item.key}
                item={item}
                activeKey={activeKey}
                activeSub={activeSub}
                businessSub={businessSub}
                availableToWork={availableToWork}
                onAvailableToWorkChange={handleAvailableToWorkChange}
                onSelect={handleSelect}
                onSubSelect={handleSubSelect}
                onBusinessSubSelect={handleBusinessSubSelect}
                isExpanded={expandedKey === item.key || activeKey === item.key}
                onToggle={handleToggle}
              />
            ))}
          </div>
        </aside>

        <section
          className="px-4 py-5 sm:px-8 sm:py-[30px]"
          style={{
            background: 'var(--color-surface)',
            borderRadius: '24px',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            minHeight: 'calc(100vh - 190px)',
            overflowY: 'auto',
          }}
        >
          {pending.page ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-3)', fontFamily: 'var(--ff-body)' }}>Loading settings data...</p>
          ) : (
            <ContentPanel
              activeKey={activeKey}
              activeSub={activeSub}
              businessSub={businessSub}
              data={data}
              pending={pending}
              actions={actions}
            />
          )}
        </section>
      </div>

      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileNav}
              className="fixed inset-0 z-40 bg-black/45 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 280 }}
              className="fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[360px] lg:hidden"
              style={{
                background: 'var(--color-surface)',
                borderRight: '1px solid var(--color-border)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              }}
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="text-base font-bold" style={{ color: 'var(--color-text-1)' }}>Settings</h2>
                    <p className="mt-1 text-xs" style={{ color: 'var(--color-text-3)' }}>
                      {activeSectionLabel}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeMobileNav}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border"
                    style={{ color: 'var(--color-text-2)' }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visibleNav.map((item) => (
                      <SidebarItem
                        key={item.key}
                        item={item}
                        activeKey={activeKey}
                        activeSub={activeSub}
                        businessSub={businessSub}
                        availableToWork={availableToWork}
                        onAvailableToWorkChange={handleAvailableToWorkChange}
                        onSelect={handleSelect}
                        onSubSelect={handleSubSelect}
                        onBusinessSubSelect={handleBusinessSubSelect}
                        isExpanded={expandedKey === item.key || activeKey === item.key}
                        onToggle={handleToggle}
                        onAfterSelect={closeMobileNav}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
