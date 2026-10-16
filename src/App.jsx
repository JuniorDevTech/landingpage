import { useMemo, useState } from "react"
import heroImg from "./assets/hero-vehicule.jpg"
import { ATOUTS, PAYS, WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "./constants"
import "./App.css"

function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offset * 60000)
  return local.toISOString().slice(0, 10)
}

function emptyForm(startedAt) {
  return {
    nom: "",
    prenom: "",
    email: "",
    pays: "",
    date_essai: "",
    website: "",
    started_at: startedAt,
  }
}

export default function App() {
  const minDate = useMemo(() => todayISO(), [])
  const whatsappHref = useMemo(() => {
    const text = encodeURIComponent(WHATSAPP_MESSAGE)
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
  }, [])

  const [form, setForm] = useState(() => emptyForm(String(Date.now())))
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState("idle")
  const [message, setMessage] = useState("")

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: "" }))
  }

  function validate(data) {
    const next = {}
    if (!data.nom.trim()) next.nom = "Le nom est obligatoire."
    if (!data.prenom.trim()) next.prenom = "Le prénom est obligatoire."
    if (data.email.trim()) {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
      if (!emailOk) next.email = "Indiquez une adresse e-mail valide."
    }
    if (!data.pays || !PAYS.includes(data.pays)) {
      next.pays = "Choisissez un pays dans la liste."
    }
    if (!data.date_essai) {
      next.date_essai = "La date d’essai souhaitée est obligatoire."
    } else if (data.date_essai < minDate) {
      next.date_essai = "Choisissez une date à partir d’aujourd’hui."
    }
    return next
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formEl = event.currentTarget
    if (!formEl.checkValidity()) {
      formEl.reportValidity()
      setErrors(validate(form))
      return
    }

    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }

    setStatus("sending")
    setMessage("")

    try {
      const response = await fetch("/api/demandes", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setStatus("error")
        setErrors(payload.errors || {})
        setMessage(
          payload.message ||
            "La demande n’a pas pu être enregistrée. Vérifiez les champs puis réessayez.",
        )
        return
      }
      setStatus("success")
      setMessage(
        payload.message ||
          "Votre demande d’essai a bien été enregistrée. Un conseiller vous recontactera pour confirmer le rendez-vous.",
      )
      setForm(emptyForm(String(Date.now())))
      setErrors({})
    } catch {
      setStatus("error")
      setMessage(
        "Connexion au serveur impossible. Vérifiez que l’API Laravel est disponible, puis réessayez.",
      )
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="#accueil">
          Horizon GT
        </a>
        <a className="topbar-cta" href="#essai">
          Réserver un essai
        </a>
      </header>

      <section className="banner" id="accueil">
        <div className="banner-copy">
          <p className="eyebrow">Essai gratuit · Afrique de l’Ouest et Centrale</p>
          <h1>Prenez le volant du Horizon GT</h1>
          <p className="lede">
            Réservez un essai sur route, sans engagement, dans le pays de votre
            choix. Découvrez un SUV pensé pour le confort, la route réelle et
            une consommation maîtrisée.
          </p>
          <a className="btn-primary" href="#essai">
            Réserver un essai
          </a>
        </div>
        <div className="banner-media">
          <img
            src={heroImg}
            alt="SUV Horizon GT champagne, vue trois-quarts avant au coucher du soleil"
            width="1280"
            height="720"
          />
        </div>
      </section>

      <section className="atouts" id="atouts" aria-labelledby="atouts-title">
        <p className="eyebrow">Pourquoi l’essayer</p>
        <h2 id="atouts-title">Trois atouts du véhicule</h2>
        <div className="atouts-grid">
          {ATOUTS.map((atout, index) => (
            <article className="atout-card" key={atout.title}>
              <span className="atout-index" aria-hidden="true">
                0{index + 1}
              </span>
              <h3>{atout.title}</h3>
              <p>{atout.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="essai" id="essai" aria-labelledby="essai-title">
        <div className="essai-intro">
          <p className="eyebrow">Formulaire</p>
          <h2 id="essai-title">Réservez votre essai</h2>
          <p>
            Indiquez vos coordonnées et la date souhaitée. Les champs marqués
            d’un astérisque sont obligatoires.
          </p>
        </div>

        {status === "success" ? (
          <div className="confirm" role="status">
            <strong>Demande bien reçue</strong>
            <p>{message}</p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setStatus("idle")
                setMessage("")
              }}
            >
              Envoyer une autre demande
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={handleSubmit} noValidate={false}>
            <div className="honeypot" aria-hidden="true">
              <label htmlFor="website">Site web</label>
              <input
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="nom">
                  Nom <span aria-hidden="true">*</span>
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="family-name"
                  value={form.nom}
                  onChange={(e) => updateField("nom", e.target.value)}
                  aria-invalid={Boolean(errors.nom)}
                  aria-describedby={errors.nom ? "err-nom" : undefined}
                />
                {errors.nom ? (
                  <p className="field-error" id="err-nom">
                    {errors.nom}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="prenom">
                  Prénom <span aria-hidden="true">*</span>
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  maxLength={100}
                  autoComplete="given-name"
                  value={form.prenom}
                  onChange={(e) => updateField("prenom", e.target.value)}
                  aria-invalid={Boolean(errors.prenom)}
                  aria-describedby={errors.prenom ? "err-prenom" : undefined}
                />
                {errors.prenom ? (
                  <p className="field-error" id="err-prenom">
                    {errors.prenom}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">E-mail (facultatif)</label>
              <input
                id="email"
                name="email"
                type="email"
                maxLength={255}
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "err-email" : undefined}
              />
              {errors.email ? (
                <p className="field-error" id="err-email">
                  {errors.email}
                </p>
              ) : null}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="pays">
                  Pays <span aria-hidden="true">*</span>
                </label>
                <select
                  id="pays"
                  name="pays"
                  required
                  value={form.pays}
                  onChange={(e) => updateField("pays", e.target.value)}
                  aria-invalid={Boolean(errors.pays)}
                  aria-describedby={errors.pays ? "err-pays" : undefined}
                >
                  <option value="">Sélectionnez un pays</option>
                  {PAYS.map((pays) => (
                    <option key={pays} value={pays}>
                      {pays}
                    </option>
                  ))}
                </select>
                {errors.pays ? (
                  <p className="field-error" id="err-pays">
                    {errors.pays}
                  </p>
                ) : null}
              </div>
              <div className="field">
                <label htmlFor="date_essai">
                  Date d’essai souhaitée <span aria-hidden="true">*</span>
                </label>
                <input
                  id="date_essai"
                  name="date_essai"
                  type="date"
                  required
                  min={minDate}
                  value={form.date_essai}
                  onChange={(e) => updateField("date_essai", e.target.value)}
                  aria-invalid={Boolean(errors.date_essai)}
                  aria-describedby={
                    errors.date_essai ? "err-date" : undefined
                  }
                />
                {errors.date_essai ? (
                  <p className="field-error" id="err-date">
                    {errors.date_essai}
                  </p>
                ) : null}
              </div>
            </div>

            {status === "error" && message ? (
              <p className="form-error" role="alert">
                {message}
              </p>
            ) : null}

            <button
              className="btn-primary"
              type="submit"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Envoi en cours…" : "Envoyer la demande"}
            </button>
          </form>
        )}
      </section>

      <footer className="footer">
        <p>Horizon GT · Demandes d’essai · {new Date().getFullYear()}</p>
      </footer>

      <a
        className="whatsapp"
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter un conseiller sur WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" width="28" height="28">
          <path
            fill="currentColor"
            d="M20.5 3.5A11 11 0 0 0 2.2 17.1L1 23l6-1.6A11 11 0 0 0 12 23a11 11 0 0 0 8.5-19.5ZM12 21a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9 9 0 1 1 12 21Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.9 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.5-.6.1-.3a.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-1 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4.1 10 10 0 0 0 2.3.8 2.2 2.2 0 0 0 2-.9 1.8 1.8 0 0 0 .4-1.2c0-.1 0-.2-.2-.3Z"
          />
        </svg>
      </a>
    </div>
  )
}
