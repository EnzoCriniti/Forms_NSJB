/**
 * @file backend/services/messageRecipientsService.mjs
 * @summary Calculo de destinatarios por tipo de mensagem.
 * @responsibility Cruzar pessoas, respostas e escala para gerar a lista de envio (com flag skipped).
 */

import { listPeople } from "../repositories/peopleRepository.mjs";
import { listResponsesByFormId } from "../repositories/responsesRepository.mjs";
import { getEscalaByFormId } from "../repositories/escalaRepository.mjs";
import { findPersonPresetById } from "../repositories/personPresetsRepository.mjs";
import { normalizePhone, personKeyOf } from "../core/messages.mjs";
import { isPersonEligibleForEscala } from "../../shared/sex.mjs";

const lower = value => String(value || "").trim().toLowerCase();

const decoratePerson = person => ({
  key: personKeyOf(person),
  name: person.name,
  grau: person.grau || "",
  sex: person.sex || "",
  phone: normalizePhone(person.phone),
});

/** Filtra candidatos por grau (vazio = todos). */
const filterByGrau = (candidates, graus) => {
  if (!Array.isArray(graus) || graus.length === 0) return candidates;
  const grauSet = new Set(graus.map(lower));
  return candidates.filter(person => grauSet.has(lower(person.grau)));
};

/** Remove os destinatarios da lista de exclusao (por chave de pessoa). */
const filterByExclusion = (candidates, excludedKeys) => {
  if (!Array.isArray(excludedKeys) || excludedKeys.length === 0) return candidates;
  const excluded = new Set(excludedKeys.map(String));
  return candidates.filter(person => !excluded.has(person.key));
};

const withSkipFlag = recipients => recipients.map(recipient => recipient.phone
  ? { ...recipient, skipped: false }
  : { ...recipient, skipped: true, skipReason: "sem_telefone" });

const filterByKeys = (people, keys) => {
  const set = new Set(keys.map(key => String(key)));
  return people.filter(person => set.has(personKeyOf(person)));
};

const getMissingPresenceRecipients = async (people, formId) => {
  const responses = await listResponsesByFormId(formId);
  const respondedKeys = new Set(responses.map(response => lower(response.respondentName)));
  return people.filter(person => !respondedKeys.has(lower(person.name)));
};

const getEscalaContext = async formId => {
  const sections = await getEscalaByFormId(formId);
  const assigned = new Set();
  let openSlots = 0;
  for (const section of sections) {
    for (const slot of section.slots || []) {
      if (slot.person) assigned.add(lower(slot.person));
      else openSlots += 1;
    }
  }
  return { assigned, openSlots };
};

export const calculateRecipients = async ({ message, type, form, group }) => {
  if (type === "new_scale") {
    return { kind: "group", group: { name: group?.name || "" }, recipients: [] };
  }

  const allPeople = (await listPeople()).filter(person => person.active !== false).map(decoratePerson);

  if (type === "fill_reminder") {
    if (!form) throw new Error("Form de presenca obrigatorio para fill_reminder.");
    const config = message?.config || {};
    const mode = config.recipients?.mode || "auto";
    let candidates = allPeople;
    if (mode === "preset") {
      const preset = config.recipients?.presetId ? await findPersonPresetById(Number(config.recipients.presetId)) : null;
      if (!preset) throw new Error("Preset de pessoas nao encontrado.");
      candidates = filterByKeys(allPeople, preset.personKeys);
    } else if (mode === "manual") {
      const keys = Array.isArray(config.recipients?.personKeys) ? config.recipients.personKeys : [];
      candidates = filterByKeys(allPeople, keys);
    } else {
      candidates = await getMissingPresenceRecipients(allPeople, form.id);
    }
    candidates = filterByGrau(candidates, config.recipients?.graus);
    candidates = filterByExclusion(candidates, config.recipients?.excludedKeys);
    return { kind: "dm", group: null, recipients: withSkipFlag(candidates) };
  }

  if (type === "open_slots") {
    if (!form) throw new Error("Form de escala obrigatorio para open_slots.");
    const config = message?.config || {};
    const { assigned, openSlots } = await getEscalaContext(form.id);
    if (openSlots === 0) {
      const error = new Error("Escala nao possui vagas em aberto.");
      error.code = "ESCALA_WITHOUT_OPEN_SLOTS";
      error.statusCode = 400;
      throw error;
    }
    // sexo da escala restringe quem recebe (unisex = todos; desconhecido fica fora de escala restrita)
    const escalaSex = form?.resultsConfig?.escalaSex;
    let candidates = allPeople.filter(person => !assigned.has(lower(person.name)));
    candidates = candidates.filter(person => isPersonEligibleForEscala(person.sex, escalaSex));
    candidates = filterByGrau(candidates, config.recipients?.graus);
    candidates = filterByExclusion(candidates, config.recipients?.excludedKeys);
    return { kind: "dm", group: null, recipients: withSkipFlag(candidates) };
  }

  throw new Error(`Tipo de mensagem desconhecido: ${type}`);
};
