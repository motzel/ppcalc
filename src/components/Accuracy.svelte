<script>
  import {diffColors} from '../utils/diffs'
  import Badge from './Badge.svelte'
  import Value from './Value.svelte'

  export let score;

  const badgesDef = [
    {name: 'SS+', min: 95, max: null, color: diffColors[9]},
    {name: 'SS', min: 90, max: 95, color: diffColors[7]},
    {name: 'S+', min: 85, max: 90, color: diffColors[5]},
    {name: 'S', min: 80, max: 85, color: diffColors[3]},
    {name: 'A', min: 70, max: 80, color: diffColors[1]},
    {name: '-', min: null, max: 70, color: 'var(--dimmed)'},
  ];

  badgesDef.forEach(badge => {
    badge.desc = `Accuracy ${badge.name} (${!badge.min ? `< ${badge.max}%` : (!badge.max ? `> ${badge.min}%` : `${badge.min}% - ${badge.max}%`)})`;
  });

  function getBadge(acc) {
    if (!acc) return null;

    return badgesDef.reduce((cum, badge) => ((!badge.min || badge.min <= acc) && (!badge.max || badge.max > acc)) ? badge : cum, badgesDef[badgesDef.length - 1]);
  }

  $: badge = getBadge(score?.percentage);
</script>

<Badge onlyLabel={true} color="white" bgColor={badge ? badge.color : 'var(--dimmed)'} title={badge ? badge.desc : badge} label="">
    <span slot="label">
      <slot name="label-before"></slot>
      <Value value={score.percentage}
             title={badge ? badge.desc : null} inline={false} suffix="%" suffixPrev="%" zero="-" withZeroSuffix={false}
      />
      <slot name="label-after"></slot>
    </span>
</Badge>

<style>
    small {
        display: block;
        text-align: center;
        white-space: nowrap;
    }
</style>