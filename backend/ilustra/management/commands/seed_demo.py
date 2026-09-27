"""Crea datos de ejemplo FICTICIOS para probar el sitio sin conexión (imágenes generadas localmente)."""
import random

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from ilustra.models import FAQ, Artwork, Chapter, ChapterPage, Comment, Follow, Like, Profile, Project, Series

User = get_user_model()

ARTISTS = [
    ("lara.traza", "Lara Montes", ["ilustracion", "boceto"], "violet", "Ilustradora. Paisajes cordilleranos y libros álbum."),
    ("tq.historietas", "Tomás Quiroga", ["historieta", "comic"], "yellow", "Historietista. Historias de barrio y colectivos de madrugada."),
    ("mei.manga", "Mei Sosa", ["manga", "boceto"], "sky", "Mangaka. Serializo «Kaze no michi»."),
    ("joaco.dibuja", "Joaquín Ríos", ["comic", "ilustracion"], "coral", "Dibujante de cómic y portadas."),
]
TITLES = ["Sierra al atardecer", "Zonda", "Retrato en tinta", "Plaza 25 de Mayo", "Estudio de manos", "La siesta",
          "Colectivo nocturno", "Viñedos", "Personaje: Aurora", "Boceto de viaje", "Lluvia de verano", "Farol"]


class Command(BaseCommand):
    help = "Carga artistas, obras, series y comentarios ficticios (marcados como demo)."

    def add_arguments(self, parser):
        parser.add_argument("--reset", action="store_true", help="Borra antes los datos demo existentes.")

    @transaction.atomic
    def handle(self, *args, **opts):
        if opts["reset"]:
            User.objects.filter(profile__is_demo=True).delete()
            Project.objects.filter(title__startswith="[Ejemplo]").delete()
        if Profile.objects.filter(is_demo=True).exists():
            self.stdout.write("Ya hay datos demo. Usá --reset para regenerarlos.")
            return
        rnd = random.Random(7)
        users = []
        for i, (handle, name, disc, accent, bio) in enumerate(ARTISTS):
            u = User.objects.create(username=f"demo_{handle}", first_name=name)
            u.set_unusable_password()
            u.save()
            Profile.objects.create(user=u, handle=handle, display_name=name, disciplines=disc, accent=accent, bio=bio,
                                   location="San Juan", is_artist=True, is_demo=True,
                                   avatar_url=f"demo:{40 + i}:400x400", cover_url=f"demo:{60 + i}:1600x400")
            users.append(u)
        visitor = User.objects.create(username="demo_visitante", first_name="Ana Paz")
        Profile.objects.create(user=visitor, handle="ana.paz", display_name="Ana Paz", is_demo=True)
        cats = ["ilustracion", "historieta", "manga", "comic", "boceto"]
        arts = []
        for i in range(24):
            author = users[i % 4]
            w, h = rnd.choice([(900, 1200), (1200, 1200), (800, 1200), (1200, 900), (900, 1300)])
            arts.append(Artwork.objects.create(author=author, title=TITLES[i % len(TITLES)] + ("" if i < 12 else " II"),
                                               description="Obra de ejemplo generada para probar el sitio.", category=cats[i % 5],
                                               image_url=f"demo:{i + 1}:{w}x{h}", width=w, height=h, tags=["ejemplo", cats[i % 5]]))
        for s_i, (author, title, cat) in enumerate([(users[1], "El último colectivo", "historieta"), (users[2], "Kaze no michi", "manga"),
                                                    (users[3], "Zonda", "comic")]):
            s = Series.objects.create(author=author, title=title, category=cat, description="Serie de ejemplo.",
                                      cover_url=f"demo:{80 + s_i}:900x1200", cover_width=900, cover_height=1200)
            for n in range(1, 4):
                ch = Chapter.objects.create(series=s, number=n, title=f"Capítulo de ejemplo {n}")
                ChapterPage.objects.bulk_create([ChapterPage(chapter=ch, order=k, image_url=f"demo:{100 + s_i * 10 + n * 3 + k}:1000x1400",
                                                             width=1000, height=1400) for k in range(3)])
        for a in arts:
            fans = rnd.sample(users + [visitor], k=rnd.randint(0, 5))
            for f in fans:
                Like.objects.create(user=f, artwork=a)
            a.like_count = len(fans)
            a.save(update_fields=["like_count"])
        for u in users:
            for v in users + [visitor]:
                if u != v and rnd.random() < 0.6:
                    Follow.objects.get_or_create(follower=v, following=u)
        c = Comment.objects.create(author=visitor, artwork=arts[0], text="¡Qué manejo de la luz!")
        Comment.objects.create(author=users[0], artwork=arts[0], parent=c, text="¡Gracias! Acuarela digital.")
        arts[0].comment_count = 2
        arts[0].save(update_fields=["comment_count"])
        Project.objects.create(title="[Ejemplo] Convocatoria de historieta", summary="Proyecto de ejemplo: reemplazalo desde el panel.",
                               image_url="demo:90:1200x800")
        if not FAQ.objects.exists():
            FAQ.objects.create(question="¿Cómo publico una obra?",
                               answer="Activá «Soy artista» en Ajustes, tocá Publicar y pegá el enlace directo de tu imagen.")
        self.stdout.write(self.style.SUCCESS("Datos demo creados: 4 artistas, 24 obras, 3 series con 3 capítulos."))
